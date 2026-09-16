import test from 'node:test'
import assert from 'node:assert/strict'
import { parse } from 'graphql'
import { withGoogleAuth } from './with-google-auth'
import type { WithGoogleAuthOptions } from './with-google-auth'

const stateSecret = 'state-secret-that-is-long-enough-1234567890'

type FakeApp = { use: (handler: unknown) => void }
type FakeContext = { marker?: string }

/**
 * Stand-in for a real KeystoneConfig: a type alias whose shape overlaps the
 * wrapper's structural view, so assigning it to KeystoneConfigLike exercises
 * the same assignability path a generated KeystoneConfig takes.
 */
type FakeConfig = {
  db?: { provider: string }
  lists?: Record<string, unknown>
  session?: { secret: string }
  server?: {
    port?: number
    extendExpressApp?: (
      app: FakeApp,
      context: FakeContext
    ) => void | Promise<void>
  }
  graphql?: {
    path?: string
    apolloConfig?: { plugins?: unknown[]; cache?: unknown }
  }
}

function options(
  overrides: Partial<WithGoogleAuthOptions> = {}
): WithGoogleAuthOptions {
  return {
    clientId: 'cid',
    clientSecret: 'sec',
    callbackUrl: 'https://cms.example/auth/google/callback',
    allowedDomains: ['mirrormedia.mg'],
    stateSecret,
    ...overrides,
  }
}

test('isEnabled false returns the very same config object', () => {
  const config: FakeConfig = {
    db: { provider: 'postgresql' },
    server: { extendExpressApp: () => undefined },
  }
  const wrapped = withGoogleAuth(config, options({ isEnabled: false }))
  assert.equal(wrapped, config)
})

test('isEnabled false does not need usable options', () => {
  const config: FakeConfig = { db: { provider: 'postgresql' } }
  assert.doesNotThrow(() =>
    withGoogleAuth(
      config,
      options({ isEnabled: false, clientId: '', allowedDomains: [] })
    )
  )
})

test('mounts the mini-app before the host extendExpressApp', async () => {
  const calls: string[] = []
  const config: FakeConfig = {
    server: {
      port: 3003,
      extendExpressApp: (_app, context) => {
        calls.push(`original:${context.marker}`)
      },
    },
  }
  const original = config.server?.extendExpressApp
  const wrapped = withGoogleAuth(config, options())

  assert.notEqual(wrapped, config)
  assert.equal(wrapped.server?.port, 3003)
  assert.notEqual(wrapped.server?.extendExpressApp, original)
  // The source config must not be mutated.
  assert.equal(config.server?.extendExpressApp, original)

  const mounted: unknown[] = []
  const app: FakeApp = {
    use: (handler) => {
      mounted.push(handler)
      calls.push('mount')
    },
  }
  await wrapped.server?.extendExpressApp?.(app, { marker: 'ctx' })

  assert.deepEqual(calls, ['mount', 'original:ctx'])
  assert.equal(mounted.length, 1)
  // createGoogleAuthMiniApp returns an express Router, which is a function.
  assert.equal(typeof mounted[0], 'function')
})

test('awaits an async host extendExpressApp', async () => {
  const calls: string[] = []
  const config: FakeConfig = {
    server: {
      extendExpressApp: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1))
        calls.push('original')
      },
    },
  }
  const wrapped = withGoogleAuth(config, options())
  await wrapped.server?.extendExpressApp?.(
    {
      use: () => calls.push('mount'),
    },
    {}
  )
  assert.deepEqual(calls, ['mount', 'original'])
})

test('works when the host has no server or extendExpressApp', async () => {
  const config: FakeConfig = { db: { provider: 'postgresql' } }
  const wrapped = withGoogleAuth(config, options())
  const mounted: unknown[] = []
  await wrapped.server?.extendExpressApp?.(
    { use: (handler) => mounted.push(handler) },
    {}
  )
  assert.equal(mounted.length, 1)
})

test('passwordLoginEnabled false prepends the block plugin and preserves apolloConfig', async () => {
  const cache = { kind: 'keyv' }
  const existing = { name: 'response-cache' }
  const graphqlConfig = {
    path: '/api/graphql',
    apolloConfig: { plugins: [existing], cache },
  }
  const config: FakeConfig = { graphql: graphqlConfig }
  const wrapped = withGoogleAuth(
    config,
    options({ passwordLoginEnabled: false })
  )

  const apollo = wrapped.graphql?.apolloConfig
  assert.equal(wrapped.graphql?.path, '/api/graphql')
  assert.equal(apollo?.cache, cache)
  assert.deepEqual(apollo?.plugins?.length, 2)
  assert.equal(apollo?.plugins?.[1], existing)
  // The source config keeps its own plugin list.
  assert.equal(graphqlConfig.apolloConfig.plugins.length, 1)

  const plugin = apollo?.plugins?.[0] as {
    requestDidStart(): Promise<{
      didResolveOperation(ctx: { document: unknown }): Promise<void>
    }>
  }
  const listener = await plugin.requestDidStart()
  await assert.rejects(
    listener.didResolveOperation({
      document: parse(
        'mutation { authenticateUserWithPassword(email:"a",password:"b"){__typename} }'
      ),
    }),
    /Password login is disabled/
  )
})

test('passwordLoginEnabled false creates graphql and apolloConfig when absent', () => {
  const config: FakeConfig = { db: { provider: 'postgresql' } }
  const wrapped = withGoogleAuth(
    config,
    options({ passwordLoginEnabled: false })
  )
  assert.equal(wrapped.graphql?.apolloConfig?.plugins?.length, 1)
  assert.equal(config.graphql, undefined)
})

test('graphql is left reference-equal when password login stays enabled', () => {
  const graphqlConfig = { apolloConfig: { plugins: [] as unknown[] } }
  for (const passwordLoginEnabled of [undefined, true]) {
    const config: FakeConfig = { graphql: graphqlConfig }
    const wrapped = withGoogleAuth(config, options({ passwordLoginEnabled }))
    assert.equal(wrapped.graphql, graphqlConfig)
  }
})

test('no graphql key is invented when password login stays enabled', () => {
  const config: FakeConfig = { db: { provider: 'postgresql' } }
  const wrapped = withGoogleAuth(config, options())
  assert.equal('graphql' in wrapped, false)
})

test('keeps unrelated config keys', () => {
  const db = { provider: 'postgresql' }
  const lists = { User: {} }
  const session = { secret: stateSecret }
  const config: FakeConfig = { db, lists, session }
  const wrapped = withGoogleAuth(config, options())
  assert.equal(wrapped.db, db)
  assert.equal(wrapped.lists, lists)
  assert.equal(wrapped.session, session)
})

test('isEnabled is not forwarded to the mini-app options', async () => {
  const config: FakeConfig = {}
  const wrapped = withGoogleAuth(config, options({ isEnabled: true }))
  const mounted: unknown[] = []
  await wrapped.server?.extendExpressApp?.(
    { use: (handler) => mounted.push(handler) },
    {}
  )
  assert.equal(mounted.length, 1)
})

test('unusable options throw when the host mounts the app', async () => {
  const config: FakeConfig = {}
  const wrapped = withGoogleAuth(config, options({ allowedDomains: [] }))
  await assert.rejects(
    async () =>
      wrapped.server?.extendExpressApp?.({ use: () => undefined }, {}),
    /\[google-auth\] allowedDomains/
  )
})
