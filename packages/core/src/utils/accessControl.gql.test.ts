import test from 'node:test'
import assert from 'node:assert/strict'

process.env.ACCESS_CONTROL_STRATEGY = 'gql'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { allowRoles, admin } = require('./accessControl')

const TOKEN = 'Bearer super-secret-token'

const makeArgs = (operation: string, session?: unknown) => ({
  operation,
  session,
  listKey: 'Post',
  context: {
    req: {
      headers: {
        'x-forwarded-for': '203.0.113.7',
        'user-agent': 'unit-test',
        authorization: TOKEN,
      },
      body: { operationName: 'CreatePost', query: 'mutation { x }' },
    },
  },
})

const check = (operation: string, session?: unknown) =>
  allowRoles(admin)(makeArgs(operation, session))

const captureLogs = (t: test.TestContext) => {
  const calls = t.mock.method(console, 'log', () => undefined)
  return () => calls.mock.calls.map((c) => c.arguments.join(' '))
}

test('log mode (default) lets anonymous writes through and logs each one', async (t) => {
  delete process.env.ANONYMOUS_WRITE_MODE
  const logs = captureLogs(t)

  for (const op of ['create', 'update', 'delete']) {
    assert.equal(await check(op), true)
  }

  const lines = logs().filter((l) => l.includes('[anonymous-write]'))
  assert.equal(lines.length, 3)
  const entry = JSON.parse(lines[0].replace('[anonymous-write]', '').trim())
  assert.equal(entry.mode, 'log')
  assert.equal(entry.listKey, 'Post')
  assert.equal(entry.operation, 'create')
  assert.equal(entry.operationName, 'CreatePost')
  assert.equal(entry.ip, '203.0.113.7')
  assert.equal(entry.userAgent, 'unit-test')
  assert.equal(entry.isHttpRequest, true)
  assert.equal(entry.hasAuthorizationHeader, true)
})

test('log output never contains the authorization value or the request body', async (t) => {
  process.env.ANONYMOUS_WRITE_MODE = 'log'
  const logs = captureLogs(t)

  await check('create')

  const text = logs().join('\n')
  assert.ok(text.includes('[anonymous-write]'))
  assert.ok(!text.includes('super-secret-token'))
  assert.ok(!text.includes('mutation { x }'))
})

test('log mode neither logs nor blocks queries', async (t) => {
  process.env.ANONYMOUS_WRITE_MODE = 'log'
  const logs = captureLogs(t)

  assert.equal(await check('query'), true)
  assert.equal(logs().filter((l) => l.includes('[anonymous-write]')).length, 0)
})

test('log mode does not log writes that carry a session', async (t) => {
  process.env.ANONYMOUS_WRITE_MODE = 'log'
  const logs = captureLogs(t)

  assert.equal(await check('create', { data: { role: 'editor' } }), true)
  assert.equal(logs().filter((l) => l.includes('[anonymous-write]')).length, 0)
})

test('off mode keeps today behaviour: anonymous writes pass, nothing is logged', async (t) => {
  process.env.ANONYMOUS_WRITE_MODE = 'off'
  const logs = captureLogs(t)

  assert.equal(await check('create'), true)
  assert.equal(await check('delete'), true)
  assert.equal(logs().filter((l) => l.includes('[anonymous-write]')).length, 0)
})

test('enforce mode rejects anonymous writes but still allows queries', async () => {
  process.env.ANONYMOUS_WRITE_MODE = 'enforce'

  for (const op of ['create', 'update', 'delete']) {
    assert.equal(await check(op), false)
  }
  assert.equal(await check('query'), true)
})

test('enforce mode still allows writes that carry a session', async () => {
  process.env.ANONYMOUS_WRITE_MODE = 'enforce'

  assert.equal(await check('create', { data: { role: 'admin' } }), true)
})

test('an unknown mode value falls back to log, not enforce', async (t) => {
  process.env.ANONYMOUS_WRITE_MODE = 'enfroce'
  const logs = captureLogs(t)

  assert.equal(await check('create'), true)
  assert.equal(logs().filter((l) => l.includes('[anonymous-write]')).length, 1)
})

test('log keeps operationName only when it is a short string', async (t) => {
  process.env.ANONYMOUS_WRITE_MODE = 'log'
  const logs = captureLogs(t)

  const args = makeArgs('create') as unknown as {
    context: { req: { body: { operationName: unknown } } }
  }
  args.context.req.body.operationName = { evil: 'x'.repeat(500) }
  await allowRoles(admin)(args)
  args.context.req.body.operationName = 'N'.repeat(500)
  await allowRoles(admin)(args)

  const entries = logs()
    .filter((l) => l.includes('[anonymous-write]'))
    .map((l) => JSON.parse(l.replace('[anonymous-write]', '').trim()))
  assert.equal(entries[0].operationName, null)
  assert.equal(entries[1].operationName.length, 100)
})

test('an unrecognised mode value warns once and still behaves as log', async (t) => {
  process.env.ANONYMOUS_WRITE_MODE = 'ENFORCE'
  captureLogs(t)
  const warnings = t.mock.method(console, 'warn', () => undefined)

  assert.equal(await check('create'), true)
  assert.equal(await check('update'), true)

  assert.equal(warnings.mock.calls.length, 1)
  const text = warnings.mock.calls[0].arguments.join(' ')
  assert.ok(text.includes('ANONYMOUS_WRITE_MODE'))
  assert.ok(text.includes('ENFORCE'))
})

test('recognised or unset mode values never warn', async (t) => {
  captureLogs(t)
  const warnings = t.mock.method(console, 'warn', () => undefined)

  for (const mode of [undefined, '', 'off', 'log', 'enforce']) {
    if (mode === undefined) delete process.env.ANONYMOUS_WRITE_MODE
    else process.env.ANONYMOUS_WRITE_MODE = mode
    await check('create')
  }

  assert.equal(warnings.mock.calls.length, 0)
})
