import Redis from 'ioredis'
import type { GraphQLSchema } from 'graphql'
import envVar from '../environment-variables'

// 鎖定程式用到 Node 專用模組，不能從 core 入口引入（入口會被 Admin UI 打包）
/* eslint-disable @typescript-eslint/no-var-requires */
const {
  createLoginLockout,
  createRedisLockoutStore,
} = require('@mirrormedia/lilith-core/lib/utils/login-lockout')
/* eslint-enable @typescript-eslint/no-var-requires */

type ExtendSchema = (schema: GraphQLSchema) => GraphQLSchema

let redis: Redis | undefined
let connecting: Promise<void> | undefined

// 第一次登入時才連線（build 時不連）；Redis 斷線時指令不排隊，立刻失敗並放行
const getRedis = async () => {
  if (!redis) {
    redis = new Redis(envVar.cache.url, {
      connectTimeout: envVar.cache.connectTimeOut || 10000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    })
    redis.on('error', (err) => {
      console.error('[login-lockout] Redis connection error:', err.message)
    })
  }
  if (redis.status === 'wait') {
    connecting ??= redis.connect().finally(() => {
      connecting = undefined
    })
  }
  if (connecting) await connecting
  return redis
}

const store = createRedisLockoutStore({
  eval: async (script: string, numKeys: number, ...args: (string | number)[]) =>
    (await getRedis()).eval(script, numKeys, ...args),
  del: async (...keys: string[]) => (await getRedis()).del(...keys),
})

// 沒有設定 REDIS_SERVER（例如本機）時不傳 store，鎖定會改用記憶體並警告一次
export const withLoginLockout = (extend?: ExtendSchema): ExtendSchema => {
  const lockout = createLoginLockout({
    store: envVar.cache.url ? store : undefined,
  })
  return (schema) => lockout(extend ? extend(schema) : schema)
}
