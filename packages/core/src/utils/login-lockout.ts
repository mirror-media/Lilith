import { createHash } from 'crypto'
import { isIP } from 'net'
import type { GraphQLSchema } from 'graphql'

// 登入失敗鎖定（環境變數 LOGIN_LOCKOUT_MODE）：
// off：不計次、不攔截；log：計次並記錄「會被鎖定」但不拒絕（預設）；
// enforce：超過門檻後直接回與一般登入失敗相同的結果，不進入真正的登入
// enforce 必須明確設定 LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS，沒設會退回 log
//
// 包住 Keystone 的 authenticate<List>WithPassword resolver，帳號與密碼取自
// 已解析的參數，不檢查查詢文字或回應
type LoginLockoutMode = 'off' | 'log' | 'enforce'

type LockoutRule = {
  maxFailures: number
  windowSeconds: number
  durationSeconds: number
}

type LockoutHit = {
  count: number
  lockedUntil: number | null
  // 這次嘗試是否落在鎖定期間（超過門檻的那一次也算）
  blocked: boolean
  // 這次嘗試剛好觸發鎖定
  justLocked: boolean
}

// hit 必須是原子的：先計次再判斷，平行的請求才不會同時通過檢查
export type LockoutStore = {
  hit(key: string, rule: LockoutRule): Promise<LockoutHit>
  reset(key: string): Promise<void>
}

type LoginLockoutOptions = {
  mode?: LoginLockoutMode
  maxFailures?: number
  windowSeconds?: number
  durationSeconds?: number
  // 可信任的 x-forwarded-for 段數（從右邊數）
  trustedProxyHops?: number
  // 鎖定回應的假等待，讓回應時間接近真正驗證密碼的失敗
  lockedDelayMs?: number
  // 儲存層超過這個時間沒回應就放行
  storeTimeoutMs?: number
  mutationField?: string
  identityField?: string
  store?: LockoutStore
  now?: () => number
}

type LockoutState = {
  count: number
  windowStart: number
  lockedUntil: number | null
}

// 與 Keystone auth 對「帳號不存在」與「密碼錯誤」回傳的物件一致
const FAILURE_RESULT = { code: 'FAILURE', message: 'Authentication failed.' }

const intFromEnv = (name: string, fallback: number) => {
  const value = Number.parseInt(process.env[name] ?? '', 10)
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

const warnedModes = new Set<string>()

const getMode = (): LoginLockoutMode => {
  const mode = process.env.LOGIN_LOCKOUT_MODE
  if (mode === 'off' || mode === 'enforce') return mode
  if (mode && mode !== 'log' && !warnedModes.has(mode)) {
    warnedModes.add(mode)
    console.warn(
      `[login-lockout] LOGIN_LOCKOUT_MODE 的值 ${JSON.stringify(
        mode.slice(0, 50)
      )} 無法辨識，已改用 log（只記錄、不拒絕）`
    )
  }
  return 'log'
}

const isLocked = (state: LockoutState, now: number) =>
  state.lockedUntil !== null && state.lockedUntil > now

// 筆數有上限，超過時先丟最舊的未鎖定紀錄，已鎖定的不會被假帳號擠掉
export const createMemoryLockoutStore = (
  now: () => number = Date.now,
  maxEntries = 10000
): LockoutStore => {
  const entries = new Map<string, { state: LockoutState; expiresAt: number }>()

  const evict = () => {
    while (entries.size > maxEntries) {
      let victim: string | undefined
      for (const [key, entry] of entries) {
        if (entry.expiresAt <= now() || !isLocked(entry.state, now())) {
          victim = key
          break
        }
      }
      victim ??= entries.keys().next().value
      if (victim === undefined) return
      entries.delete(victim)
    }
  }

  return {
    // 整個函式沒有 await，所以在單一行程內是原子的
    async hit(key, rule) {
      const current = entries.get(key)
      const state =
        current && current.expiresAt > now() ? current.state : undefined

      if (state && isLocked(state, now())) {
        return {
          count: state.count,
          lockedUntil: state.lockedUntil,
          blocked: true,
          justLocked: false,
        }
      }

      // 沒有紀錄、計次視窗已過、或上一輪鎖定已到期，都從頭計
      const fresh =
        !state ||
        now() - state.windowStart > rule.windowSeconds * 1000 ||
        state.lockedUntil !== null
      const count = (fresh || !state ? 0 : state.count) + 1
      const next: LockoutState = {
        count,
        windowStart: fresh || !state ? now() : state.windowStart,
        lockedUntil: null,
      }
      const justLocked = count > rule.maxFailures
      if (justLocked) next.lockedUntil = now() + rule.durationSeconds * 1000

      // 先刪再放，讓更新過的鑰匙排到最後
      entries.delete(key)
      entries.set(key, {
        state: next,
        expiresAt:
          now() + Math.max(rule.windowSeconds, rule.durationSeconds) * 1000,
      })
      evict()

      return {
        count,
        lockedUntil: next.lockedUntil,
        blocked: justLocked,
        justLocked,
      }
    },
    async reset(key) {
      entries.delete(key)
    },
  }
}

// 與 ioredis 相容的最小介面，由使用的套件傳入，core 本身不依賴 Redis 套件
type RedisLike = {
  eval(
    script: string,
    numKeys: number,
    ...args: (string | number)[]
  ): Promise<unknown>
  del(...keys: string[]): Promise<unknown>
}

// 需要 Redis 5.0 以上（先呼叫 TIME 再寫入）。時間取自 Redis，整段以 Lua
// 執行所以平行請求不會漏算；lockedUntil 存 0 代表沒有鎖定
const HIT_SCRIPT = `
local t = redis.call('TIME')
local now = t[1] * 1000 + math.floor(t[2] / 1000)
local max = tonumber(ARGV[1])
local window = tonumber(ARGV[2]) * 1000
local duration = tonumber(ARGV[3]) * 1000
local s = redis.call('HMGET', KEYS[1], 'count', 'windowStart', 'lockedUntil')
local count = tonumber(s[1])
local windowStart = tonumber(s[2])
local lockedUntil = tonumber(s[3])
if lockedUntil and lockedUntil > now then
  return {count, lockedUntil, 1, 0}
end
if (not count) or (now - windowStart > window) or (lockedUntil and lockedUntil > 0) then
  count = 0
  windowStart = now
end
count = count + 1
local locked = 0
lockedUntil = 0
if count > max then
  lockedUntil = now + duration
  locked = 1
end
redis.call('HSET', KEYS[1], 'count', count, 'windowStart', windowStart, 'lockedUntil', lockedUntil)
redis.call('PEXPIRE', KEYS[1], math.max(window, duration))
return {count, lockedUntil, locked, locked}
`

export const createRedisLockoutStore = (
  client: RedisLike,
  options: { keyPrefix?: string } = {}
): LockoutStore => {
  const prefix = options.keyPrefix ?? 'login-lockout:'
  return {
    async hit(key, rule) {
      const [count, lockedUntil, blocked, justLocked] = (await client.eval(
        HIT_SCRIPT,
        1,
        prefix + key,
        rule.maxFailures,
        rule.windowSeconds,
        rule.durationSeconds
      )) as number[]
      return {
        count,
        lockedUntil: lockedUntil > 0 ? lockedUntil : null,
        blocked: blocked === 1,
        justLocked: justLocked === 1,
      }
    },
    async reset(key) {
      await client.del(prefix + key)
    },
  }
}

type RequestLike = {
  headers?: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
}

// 取 x-forwarded-for 從右邊數第 hops 段；最左邊的值可由用戶端任意填寫，
// 標頭不夠長或不是合法 IP 時改用連線的來源位址
const getClientIp = (
  req: RequestLike | undefined,
  hops: number
): { ip: string; forwardedCount: number } => {
  const header = req?.headers?.['x-forwarded-for']
  const raw = Array.isArray(header) ? header[0] : header
  const parts = (raw ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const candidate =
    parts.length >= hops ? parts[parts.length - hops] : undefined
  if (candidate && isIP(candidate)) {
    return { ip: candidate, forwardedCount: parts.length }
  }

  const remote = req?.socket?.remoteAddress
  return {
    ip: remote && isIP(remote) ? remote : 'unknown',
    forwardedCount: parts.length,
  }
}

const shortHash = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, 12)

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`儲存層超過 ${ms} 毫秒沒有回應`)),
      ms
    )
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })

// 回傳可放在 extendGraphqlSchema 最外層的函式。預設的記憶體儲存只在單一
// 行程內有效，多個實例共用請改傳 createRedisLockoutStore
export function createLoginLockout(options: LoginLockoutOptions = {}) {
  const now = options.now ?? Date.now
  const store = options.store ?? createMemoryLockoutStore(now)
  const mutationField = options.mutationField ?? 'authenticateUserWithPassword'
  const identityField = options.identityField ?? 'email'

  // enforce 要明確設定 hops：預設值猜錯時，經過代理的所有人會共用同一個鑰匙
  let warnedHops = false
  const resolveMode = (mode: LoginLockoutMode, hopsExplicit: boolean) => {
    if (mode !== 'enforce' || hopsExplicit) return mode
    if (!warnedHops) {
      warnedHops = true
      console.warn(
        '[login-lockout] enforce 需要明確設定 LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS（至少 1），已改用 log（只記錄、不拒絕）'
      )
    }
    return 'log'
  }

  const settings = () => {
    // 整段都要是數字：1abc、1.5 這類值不算明確設定
    const envRaw = process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS?.trim()
    const configuredHops =
      options.trustedProxyHops ?? (envRaw ? Number(envRaw) : undefined)
    const hopsExplicit =
      configuredHops !== undefined &&
      Number.isInteger(configuredHops) &&
      configuredHops >= 1

    return {
      mode: resolveMode(options.mode ?? getMode(), hopsExplicit),
      rule: {
        maxFailures:
          options.maxFailures ?? intFromEnv('LOGIN_LOCKOUT_MAX_FAILURES', 5),
        windowSeconds:
          options.windowSeconds ??
          intFromEnv('LOGIN_LOCKOUT_WINDOW_SECONDS', 900),
        durationSeconds:
          options.durationSeconds ??
          intFromEnv('LOGIN_LOCKOUT_DURATION_SECONDS', 900),
      },
      hops: hopsExplicit ? (configuredHops as number) : 1,
      delayMs:
        options.lockedDelayMs ??
        intFromEnv('LOGIN_LOCKOUT_LOCKED_DELAY_MS', 100),
      timeoutMs:
        options.storeTimeoutMs ??
        intFromEnv('LOGIN_LOCKOUT_STORE_TIMEOUT_MS', 500),
    }
  }

  const logEvent = (
    event: string,
    key: string,
    mode: string,
    forwardedCount: number
  ) => {
    const [account, ip] = key.split('|')
    console.log(
      '[login-lockout]',
      JSON.stringify({
        timestamp: new Date(now()).toISOString(),
        event,
        mode,
        account,
        ip,
        forwardedCount,
      })
    )
  }

  const warnStore = (error: unknown) =>
    console.warn(
      '[login-lockout] 儲存層無法使用，本次登入不做鎖定檢查：',
      error instanceof Error ? error.message : String(error)
    )

  return (schema: GraphQLSchema): GraphQLSchema => {
    const field = schema.getMutationType()?.getFields()[mutationField]
    const original = field?.resolve
    if (!field || !original) {
      console.warn(
        `[login-lockout] 找不到 ${mutationField} 的 resolver，登入鎖定未啟用`
      )
      return schema
    }

    field.resolve = async (source, args, context, info) => {
      const config = settings()
      const identity = (args as Record<string, unknown>)?.[identityField]
      if (config.mode === 'off' || typeof identity !== 'string') {
        return original(source, args, context, info)
      }

      const { ip, forwardedCount } = getClientIp(
        (context as { req?: RequestLike })?.req,
        config.hops
      )
      const key = `${shortHash(identity.trim().toLowerCase())}|${ip}`

      let hit: LockoutHit | undefined
      try {
        hit = await withTimeout(store.hit(key, config.rule), config.timeoutMs)
      } catch (error) {
        warnStore(error)
        return original(source, args, context, info)
      }

      if (hit.blocked) {
        if (config.mode === 'enforce') {
          logEvent(
            hit.justLocked ? 'lock-start' : 'blocked',
            key,
            config.mode,
            forwardedCount
          )
          if (config.delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, config.delayMs))
          }
          return { ...FAILURE_RESULT }
        }
        logEvent(
          hit.justLocked ? 'would-lock' : 'would-block',
          key,
          config.mode,
          forwardedCount
        )
      } else if (config.mode === 'log') {
        // log 模式每次嘗試都記錄，用來確認 hops 取到的是不是用戶端 IP
        logEvent('attempt', key, config.mode, forwardedCount)
      }

      const result = await original(source, args, context, info)

      // 登入成功就歸零；失敗或沒有結果（例如發生錯誤）都維持已計的次數
      if (result && (result as { code?: string }).code !== 'FAILURE') {
        try {
          await withTimeout(store.reset(key), config.timeoutMs)
        } catch (error) {
          warnStore(error)
        }
      }
      return result
    }

    return schema
  }
}
