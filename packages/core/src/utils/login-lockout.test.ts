import test from 'node:test'
import assert from 'node:assert/strict'
import { ApolloServer, HeaderMap } from '@apollo/server'
import { buildSchema } from 'graphql'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lockout = require('./login-lockout')
const { createLoginLockout, createMemoryLockoutStore } = lockout

// 仿照 Keystone auth：失敗一律回 { code: 'FAILURE' }，不分帳號是否存在
const sdl = `
  type Query { ping: Int }
  type UserAuthenticationWithPasswordSuccess { sessionToken: String! }
  type UserAuthenticationWithPasswordFailure { message: String! }
  union UserAuthenticationWithPasswordResult =
    UserAuthenticationWithPasswordSuccess | UserAuthenticationWithPasswordFailure
  type Mutation {
    authenticateUserWithPassword(email: String!, password: String!):
      UserAuthenticationWithPasswordResult
    other: Int
  }
`

const MUTATION = `mutation($email: String!, $password: String!) {
  authenticateUserWithPassword(email: $email, password: $password) {
    ... on UserAuthenticationWithPasswordSuccess { sessionToken }
    ... on UserAuthenticationWithPasswordFailure { message }
  }
}`

// Apollo 序列化結果時結尾固定帶換行，被鎖定的回應也必須一樣
const SUCCESS_BODY =
  '{"data":{"authenticateUserWithPassword":{"sessionToken":"token"}}}\n'
const FAILURE_BODY =
  '{"data":{"authenticateUserWithPassword":{"message":"Authentication failed."}}}\n'

type Options = Record<string, unknown>

const makeApp = (options: Options = {}) => {
  let clock = 1_000_000
  let realLogins = 0

  const schema = buildSchema(sdl)
  const mutationType = schema.getMutationType()
  if (!mutationType) throw new Error('測試用的結構沒有 Mutation')
  const mutation = mutationType.getFields()
  mutation.authenticateUserWithPassword.resolve = (
    _root: unknown,
    args: { email: string; password: string }
  ) => {
    realLogins++
    return args.email === 'alice@example.com' && args.password === 'right'
      ? { sessionToken: 'token' }
      : { code: 'FAILURE', message: 'Authentication failed.' }
  }
  mutation.other.resolve = () => 1
  const union = schema.getType(
    'UserAuthenticationWithPasswordResult'
  ) as unknown as { resolveType: (v: { code?: string }) => string }
  union.resolveType = (v) =>
    v.code === 'FAILURE'
      ? 'UserAuthenticationWithPasswordFailure'
      : 'UserAuthenticationWithPasswordSuccess'

  const wrapped = createLoginLockout({
    mode: 'enforce',
    maxFailures: 5,
    windowSeconds: 900,
    durationSeconds: 900,
    lockedDelayMs: 0,
    trustedProxyHops: 1,
    now: () => clock,
    store: createMemoryLockoutStore(() => clock),
    ...options,
  })(schema)

  const server = new ApolloServer({ schema: wrapped })

  const run = async (
    query: string,
    variables: Record<string, unknown> | undefined,
    ip: string
  ) => {
    const res = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: 'POST',
        headers: new HeaderMap([['content-type', 'application/json']]),
        search: '',
        body: variables ? { query, variables } : { query },
      },
      context: async () => ({
        req: { headers: { 'x-forwarded-for': ip }, socket: {} },
      }),
    })
    const body = res.body.kind === 'complete' ? res.body.string : ''
    return { status: res.status ?? 200, body }
  }

  const login = (email: string, password: string, ip = '203.0.113.7') =>
    run(MUTATION, { email, password }, ip)

  return {
    server,
    run,
    login,
    advance: (seconds: number) => {
      clock += seconds * 1000
    },
    realLogins: () => realLogins,
  }
}

// @types/node 沒有 node:test 的 mock 型別，這裡自行轉型
type Mocker = {
  mock: {
    method: (
      target: object,
      name: string,
      impl: () => void
    ) => { mock: { calls: { arguments: unknown[] }[] } }
  }
}

const quiet = (ctx: unknown) => {
  const t = ctx as Mocker
  const log = t.mock.method(console, 'log', () => undefined)
  const warn = t.mock.method(console, 'warn', () => undefined)
  return {
    logs: () => log.mock.calls.map((c) => c.arguments.join(' ')),
    warns: () => warn.mock.calls.map((c) => c.arguments.join(' ')),
  }
}

const withApp = async (
  t: unknown,
  options: Options,
  body: (app: ReturnType<typeof makeApp>) => Promise<void>
) => {
  const out = quiet(t)
  const app = makeApp(options)
  await app.server.start()
  try {
    await body(app)
  } finally {
    await app.server.stop()
  }
  return out
}

test('正常登入不受影響:失敗 4 次後第 5 次輸入正確仍成功並歸零', async (t) => {
  await withApp(t, {}, async (app) => {
    for (let i = 0; i < 4; i++) {
      assert.equal(
        (await app.login('alice@example.com', 'bad')).body,
        FAILURE_BODY
      )
    }
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )

    for (let i = 0; i < 4; i++) await app.login('alice@example.com', 'bad')
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )
  })
})

test('連續失敗 5 次後鎖定,連正確密碼也失敗且不進入真正的登入,到期自動恢復', async (t) => {
  await withApp(t, {}, async (app) => {
    for (let i = 0; i < 5; i++) await app.login('alice@example.com', 'bad')
    const before = app.realLogins()

    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      FAILURE_BODY
    )
    assert.equal(app.realLogins(), before)

    app.advance(899)
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      FAILURE_BODY
    )

    app.advance(2)
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )
  })
})

test('鎖定只影響同一帳號加同一 IP,帳號大小寫與前後空白視為相同', async (t) => {
  await withApp(t, {}, async (app) => {
    for (let i = 0; i < 5; i++) await app.login(' Alice@Example.com ', 'bad')

    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      FAILURE_BODY
    )
    assert.equal(
      (await app.login('alice@example.com', 'right', '198.51.100.9')).body,
      SUCCESS_BODY
    )
  })
})

test('存在與不存在的帳號,逐次回應(狀態碼與內容)完全相同', async (t) => {
  await withApp(t, {}, async (app) => {
    for (let i = 0; i < 7; i++) {
      const existing = await app.login(
        'alice@example.com',
        'bad',
        '198.51.100.1'
      )
      const missing = await app.login(
        'ghost@example.com',
        'bad',
        '198.51.100.2'
      )
      assert.deepEqual(existing, missing, `第 ${i + 1} 次`)
      assert.equal(existing.body, FAILURE_BODY)
    }
  })
})

// ---- 繞過手法 ----

test('一個請求用別名塞多組猜測,每組都計次,超過門檻後不再進入真正的登入', async (t) => {
  await withApp(t, { maxFailures: 3 }, async (app) => {
    const fields = Array.from(
      { length: 10 },
      (_, i) =>
        `a${i}: authenticateUserWithPassword(email: "alice@example.com", password: "g${i}") { ... on UserAuthenticationWithPasswordFailure { message } }`
    ).join('\n')

    await app.run(`mutation { ${fields} }`, undefined, '203.0.113.7')

    assert.equal(app.realLogins(), 3)
  })
})

test('別名批次裡的不同帳號各自計次', async (t) => {
  await withApp(t, { maxFailures: 2 }, async (app) => {
    const guess = (alias: string, email: string) =>
      `${alias}: authenticateUserWithPassword(email: "${email}", password: "x") { ... on UserAuthenticationWithPasswordFailure { message } }`
    const query = `mutation { ${guess('a', 'u1@x.com')} ${guess(
      'b',
      'u2@x.com'
    )} ${guess('c', 'u1@x.com')} ${guess('d', 'u2@x.com')} ${guess(
      'e',
      'u1@x.com'
    )} ${guess('f', 'u2@x.com')} }`

    await app.run(query, undefined, '203.0.113.7')

    assert.equal(app.realLogins(), 4)
  })
})

test('登入欄位放在 fragment 裡也會計次', async (t) => {
  await withApp(t, { maxFailures: 3 }, async (app) => {
    const query = `mutation { ...M } fragment M on Mutation {
      authenticateUserWithPassword(email: "alice@example.com", password: "x") {
        ... on UserAuthenticationWithPasswordFailure { message }
      }
    }`
    for (let i = 0; i < 10; i++) await app.run(query, undefined, '203.0.113.7')

    assert.equal(app.realLogins(), 3)
  })
})

test('帳號寫在變數預設值(沒有傳入變數)也會計次', async (t) => {
  await withApp(t, { maxFailures: 3 }, async (app) => {
    const query = `mutation($e: String = "alice@example.com") {
      authenticateUserWithPassword(email: $e, password: "x") {
        ... on UserAuthenticationWithPasswordFailure { message }
      }
    }`
    for (let i = 0; i < 10; i++) await app.run(query, undefined, '203.0.113.7')

    assert.equal(app.realLogins(), 3)
  })
})

test('只選取「成功」欄位時,失敗也不會把次數歸零', async (t) => {
  await withApp(t, { maxFailures: 3 }, async (app) => {
    const query = `mutation($email: String!, $password: String!) {
      authenticateUserWithPassword(email: $email, password: $password) {
        ... on UserAuthenticationWithPasswordSuccess { sessionToken }
      }
    }`
    for (let i = 0; i < 10; i++) {
      await app.run(
        query,
        { email: 'alice@example.com', password: 'bad' },
        '203.0.113.7'
      )
    }

    assert.equal(app.realLogins(), 3)
  })
})

test('鎖定時,同一請求裡的其他欄位與別名照常回傳,結構和一般失敗相同', async (t) => {
  await withApp(t, { maxFailures: 2 }, async (app) => {
    const query = `mutation {
      x: authenticateUserWithPassword(email: "alice@example.com", password: "bad") {
        __typename ... on UserAuthenticationWithPasswordFailure { message }
      }
      other
      y: other
    }`
    const normal = await app.run(query, undefined, '198.51.100.1')
    for (let i = 0; i < 3; i++) await app.run(query, undefined, '203.0.113.7')
    const locked = await app.run(query, undefined, '203.0.113.7')

    assert.deepEqual(locked, normal)
    assert.ok(
      locked.body.includes('"other":1') && locked.body.includes('"y":1')
    )
  })
})

test('平行的請求同時猜密碼,真正進入登入的次數仍不超過門檻', async (t) => {
  await withApp(t, { maxFailures: 3 }, async (app) => {
    await Promise.all(
      Array.from({ length: 20 }, () => app.login('alice@example.com', 'bad'))
    )

    assert.equal(app.realLogins(), 3)
  })
})

test('用大量假帳號塞爆儲存,不會洗掉已經鎖定的帳號', async (t) => {
  await withApp(
    t,
    { store: createMemoryLockoutStore(() => 1_000_000, 50) },
    async (app) => {
      // 第 6 次嘗試才會觸發鎖定
      for (let i = 0; i < 6; i++) await app.login('alice@example.com', 'bad')

      for (let i = 0; i < 200; i++)
        await app.login(`junk${i}@example.com`, 'bad')

      assert.equal(
        (await app.login('alice@example.com', 'right')).body,
        FAILURE_BODY
      )
    }
  )
})

// ---- 模式與故障 ----

test('log 模式超過門檻仍可登入,並記錄「會被鎖定」', async (t) => {
  const out = await withApp(t, { mode: 'log' }, async (app) => {
    for (let i = 0; i < 6; i++) await app.login('alice@example.com', 'bad')
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )
  })

  assert.ok(
    out
      .logs()
      .some((l) => l.includes('[login-lockout]') && l.includes('would-block'))
  )
})

test('off 模式不計次、不記錄、不攔截', async (t) => {
  const out = await withApp(t, { mode: 'off' }, async (app) => {
    for (let i = 0; i < 10; i++) await app.login('alice@example.com', 'bad')
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )
  })

  assert.equal(
    out.logs().filter((l) => l.includes('[login-lockout]')).length,
    0
  )
})

test('儲存層出錯時登入照常進行並警告', async (t) => {
  const broken = {
    hit: async () => {
      throw new Error('redis down')
    },
    reset: async () => {
      throw new Error('redis down')
    },
  }
  const out = await withApp(t, { store: broken }, async (app) => {
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )
    assert.equal(
      (await app.login('alice@example.com', 'bad')).body,
      FAILURE_BODY
    )
  })

  assert.ok(out.warns().some((w) => w.includes('[login-lockout]')))
})

test('儲存層卡住不回應時,逾時後登入照常進行', async (t) => {
  const hanging = {
    hit: () => new Promise(() => undefined),
    reset: () => new Promise(() => undefined),
  }
  await withApp(t, { store: hanging, storeTimeoutMs: 50 }, async (app) => {
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )
  })
})

test('非登入的請求不受影響', async (t) => {
  await withApp(t, {}, async (app) => {
    const res = await app.run('{ ping }', undefined, '203.0.113.7')
    assert.equal(res.body, '{"data":{"ping":null}}\n')
  })
})

test('IP 取代理鏈中可信任的那一段,偽造的前段不影響', async (t) => {
  await withApp(t, { trustedProxyHops: 1 }, async (app) => {
    for (let i = 0; i < 5; i++) {
      await app.login('alice@example.com', 'bad', `1.2.3.${i}, 203.0.113.7`)
    }
    assert.equal(
      (await app.login('alice@example.com', 'right', '9.9.9.9, 203.0.113.7'))
        .body,
      FAILURE_BODY
    )
  })
})

test('記憶體儲存有筆數上限,超過時丟掉最舊的未鎖定紀錄', async () => {
  const rule = { maxFailures: 5, windowSeconds: 900, durationSeconds: 900 }
  const store = createMemoryLockoutStore(() => 1_000_000, 3)

  for (const key of ['a', 'b', 'c', 'd', 'e']) await store.hit(key, rule)

  // 被丟掉的 a 重新計次,從 1 開始;還在的 e 已經是第 2 次
  assert.equal((await store.hit('a', rule)).count, 1)
  assert.equal((await store.hit('e', rule)).count, 2)
})

// ---- IP 取法 ----

test('trustedProxyHops 小於 1 不算明確設定:enforce 退回 log 並警告,不會讓所有人共用鑰匙', async (t) => {
  const out = await withApp(t, { trustedProxyHops: 0 }, async (app) => {
    for (let i = 0; i < 6; i++) {
      await app.login('alice@example.com', 'bad', '203.0.113.7')
    }
    assert.equal(
      (await app.login('alice@example.com', 'right', '203.0.113.7')).body,
      SUCCESS_BODY
    )
  })

  assert.ok(
    out.warns().some((w) => w.includes('LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS'))
  )
})

test('enforce 沒有明確設定 trustedProxyHops 時退回 log,只警告一次,不拒絕登入', async (t) => {
  const out = await withApp(t, { trustedProxyHops: undefined }, async (app) => {
    for (let i = 0; i < 8; i++) {
      await app.login('alice@example.com', 'bad', '203.0.113.7')
    }
    assert.equal(
      (await app.login('alice@example.com', 'right', '203.0.113.7')).body,
      SUCCESS_BODY
    )
  })

  const warns = out
    .warns()
    .filter((w) => w.includes('LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS'))
  assert.equal(warns.length, 1)
  assert.ok(out.logs().some((l) => l.includes('would-block')))
})

test('hops 不是整數(1.5)不算明確設定:enforce 退回 log 並警告', async (t) => {
  const out = await withApp(t, { trustedProxyHops: 1.5 }, async (app) => {
    for (let i = 0; i < 6; i++) {
      await app.login('alice@example.com', 'bad', '203.0.113.7')
    }
    assert.equal(
      (await app.login('alice@example.com', 'right', '203.0.113.7')).body,
      SUCCESS_BODY
    )
  })

  assert.ok(
    out.warns().some((w) => w.includes('LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS'))
  )
})

test('環境變數 hops 帶了多餘的字(1abc、1.5)不算明確設定', async (t) => {
  const previous = process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS
  try {
    for (const bad of ['1abc', '1.5']) {
      process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS = bad
      const out = await withApp(
        t,
        { trustedProxyHops: undefined },
        async (app) => {
          for (let i = 0; i < 6; i++) {
            await app.login('alice@example.com', 'bad', '203.0.113.7')
          }
          assert.equal(
            (await app.login('alice@example.com', 'right', '203.0.113.7')).body,
            SUCCESS_BODY,
            bad
          )
        }
      )
      assert.ok(
        out.warns().some((w) => w.includes('LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS')),
        bad
      )
    }
  } finally {
    if (previous === undefined)
      delete process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS
    else process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS = previous
  }
})

test('用環境變數明確設定 LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS 就能 enforce', async (t) => {
  const previous = process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS
  process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS = '1'
  try {
    await withApp(t, { trustedProxyHops: undefined }, async (app) => {
      for (let i = 0; i < 6; i++) {
        await app.login('alice@example.com', 'bad', '203.0.113.7')
      }
      assert.equal(
        (await app.login('alice@example.com', 'right', '203.0.113.7')).body,
        FAILURE_BODY
      )
    })
  } finally {
    if (previous === undefined)
      delete process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS
    else process.env.LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS = previous
  }
})

test('log 模式沒有設定 trustedProxyHops 不警告', async (t) => {
  const out = await withApp(
    t,
    { mode: 'log', trustedProxyHops: undefined },
    async (app) => {
      await app.login('alice@example.com', 'bad')
    }
  )

  assert.equal(
    out.warns().filter((w) => w.includes('LOGIN_LOCKOUT_TRUSTED_PROXY_HOPS'))
      .length,
    0
  )
})

test('log 模式每次嘗試都記錄 x-forwarded-for 的段數,用來確認 hops', async (t) => {
  const out = await withApp(t, { mode: 'log' }, async (app) => {
    await app.login('alice@example.com', 'bad', '1.2.3.4, 203.0.113.7')
    await app.login('alice@example.com', 'bad', '203.0.113.8')
  })

  const attempts = out
    .logs()
    .filter(
      (l) => l.includes('[login-lockout]') && l.includes('"event":"attempt"')
    )
    .map((l) => JSON.parse(l.replace('[login-lockout]', '').trim()))
  assert.deepEqual(
    attempts.map((a) => a.forwardedCount),
    [2, 1]
  )
  assert.equal(attempts[0].ip, '203.0.113.7')
})

test('代理鏈比設定的段數短時,不信任可偽造的標頭,改用連線的來源位址', async (t) => {
  await withApp(t, { trustedProxyHops: 3 }, async (app) => {
    // 標頭只有 1 段,不夠 3 段:不能退回「最左邊」那個可由攻擊者任意填的值
    for (let i = 0; i < 6; i++) {
      await app.login('alice@example.com', 'bad', `7.7.7.${i}`)
    }
    assert.equal(
      (await app.login('alice@example.com', 'right', '7.7.7.99')).body,
      FAILURE_BODY
    )
  })
})

test('不是合法 IP 的標頭值不當鑰匙,改用連線的來源位址', async (t) => {
  await withApp(t, {}, async (app) => {
    for (let i = 0; i < 6; i++) {
      await app.login('alice@example.com', 'bad', `not-an-ip-${i}`)
    }
    assert.equal(
      (await app.login('alice@example.com', 'right', 'not-an-ip-new')).body,
      FAILURE_BODY
    )
  })
})

test('儲存層逾時後,遲到的結果不影響本次登入', async (t) => {
  let late = 0
  const slow = {
    hit: () =>
      new Promise((resolve) =>
        setTimeout(() => {
          late++
          resolve({
            count: 99,
            lockedUntil: null,
            blocked: true,
            justLocked: true,
          })
        }, 100)
      ),
    reset: async () => undefined,
  }
  await withApp(t, { store: slow, storeTimeoutMs: 20 }, async (app) => {
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )
    await new Promise((resolve) => setTimeout(resolve, 150))
    assert.equal(late, 1)
    // 遲到的 blocked 結果不能讓下一次(同樣逾時)的登入被拒
    assert.equal(
      (await app.login('alice@example.com', 'right')).body,
      SUCCESS_BODY
    )
  })
})

// ---- 儲存層合約:記憶體版與 Redis 版必須行為一致 ----
// Redis 版需要真的 Redis,用 LOGIN_LOCKOUT_TEST_REDIS_URL 指定;沒設定時略過

const REDIS_URL = process.env.LOGIN_LOCKOUT_TEST_REDIS_URL
// 略過時 Lua 腳本不會被測到，所以在原因裡明講
const REDIS_SKIP = REDIS_URL
  ? false
  : '未設定 LOGIN_LOCKOUT_TEST_REDIS_URL，略過需要真的 Redis 的測試（Lua 腳本沒有被測到）'
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const RULE = { maxFailures: 3, windowSeconds: 1, durationSeconds: 1 }

type StoreFactory = {
  name: string
  skip?: boolean | string
  make: () => Promise<{
    store: {
      hit: (k: string, r: typeof RULE) => Promise<Record<string, unknown>>
      reset: (k: string) => Promise<void>
    }
    close: () => Promise<void>
  }>
}

const factories: StoreFactory[] = [
  {
    name: '記憶體',
    make: async () => ({
      store: createMemoryLockoutStore(),
      close: async () => undefined,
    }),
  },
  {
    name: 'Redis',
    skip: REDIS_SKIP,
    make: async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Redis = require('ioredis')
      const client = new Redis(REDIS_URL)
      const prefix = `lockout-test:${Date.now()}:${Math.random()}:`
      return {
        store: lockout.createRedisLockoutStore(client, { keyPrefix: prefix }),
        close: async () => {
          await client.quit()
        },
      }
    },
  },
]

for (const factory of factories) {
  const label = `[${factory.name}儲存]`
  const opts = { skip: factory.skip }

  test(`${label} 前 3 次放行,第 4 次起鎖定,鎖定中不延長`, opts, async () => {
    const { store, close } = await factory.make()
    for (let i = 1; i <= 3; i++) {
      const hit = await store.hit('k', RULE)
      assert.equal(hit.count, i)
      assert.equal(hit.blocked, false)
      assert.equal(hit.lockedUntil, null)
    }
    const fourth = await store.hit('k', RULE)
    assert.equal(fourth.blocked, true)
    assert.equal(fourth.justLocked, true)
    assert.equal(typeof fourth.lockedUntil, 'number')

    const fifth = await store.hit('k', RULE)
    assert.equal(fifth.blocked, true)
    assert.equal(fifth.justLocked, false)
    assert.equal(fifth.lockedUntil, fourth.lockedUntil)
    await close()
  })

  test(`${label} 鎖定到期後從頭計次`, opts, async () => {
    const { store, close } = await factory.make()
    for (let i = 0; i < 4; i++) await store.hit('k', RULE)
    await sleep(1200)

    const hit = await store.hit('k', RULE)
    assert.equal(hit.blocked, false)
    assert.equal(hit.count, 1)
    await close()
  })

  test(`${label} 計次視窗過了就從頭計`, opts, async () => {
    const { store, close } = await factory.make()
    await store.hit('k', RULE)
    await store.hit('k', RULE)
    await sleep(1200)

    assert.equal((await store.hit('k', RULE)).count, 1)
    await close()
  })

  test(`${label} reset 清除計次,不同鑰匙互不影響`, opts, async () => {
    const { store, close } = await factory.make()
    await store.hit('a', RULE)
    await store.hit('a', RULE)
    await store.hit('b', RULE)
    await store.reset('a')

    assert.equal((await store.hit('a', RULE)).count, 1)
    assert.equal((await store.hit('b', RULE)).count, 2)
    await close()
  })

  test(`${label} 20 個平行請求只有門檻內的 3 次放行`, opts, async () => {
    const { store, close } = await factory.make()
    const hits = await Promise.all(
      Array.from({ length: 20 }, () => store.hit('k', RULE))
    )

    assert.equal(hits.filter((h) => !h.blocked).length, 3)
    assert.equal(hits.filter((h) => h.justLocked).length, 1)
    await close()
  })
}

test(
  'Redis 儲存:鑰匙有到期時間,不會永遠留在 Redis',
  { skip: REDIS_SKIP },
  async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Redis = require('ioredis')
    const client = new Redis(REDIS_URL)
    const prefix = `lockout-test:${Date.now()}:${Math.random()}:`
    const store = lockout.createRedisLockoutStore(client, { keyPrefix: prefix })

    await store.hit('k', {
      maxFailures: 3,
      windowSeconds: 60,
      durationSeconds: 120,
    })
    const ttl = await client.pttl(`${prefix}k`)

    assert.ok(ttl > 60_000 && ttl <= 120_000, `ttl=${ttl}`)
    await client.quit()
  }
)

test(
  'Redis 儲存搭配完整登入流程:鎖定與回應一致',
  { skip: REDIS_SKIP },
  async (t) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Redis = require('ioredis')
    const client = new Redis(REDIS_URL)
    const prefix = `lockout-test:${Date.now()}:${Math.random()}:`
    const store = lockout.createRedisLockoutStore(client, { keyPrefix: prefix })

    await withApp(t, { store }, async (app) => {
      for (let i = 0; i < 5; i++) await app.login('alice@example.com', 'bad')
      assert.equal(
        (await app.login('alice@example.com', 'right')).body,
        FAILURE_BODY
      )
      assert.equal(
        (await app.login('alice@example.com', 'right', '198.51.100.9')).body,
        SUCCESS_BODY
      )
    })
    await client.quit()
  }
)
