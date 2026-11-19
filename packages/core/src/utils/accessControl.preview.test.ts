import test from 'node:test'
import assert from 'node:assert/strict'

process.env.ACCESS_CONTROL_STRATEGY = 'preview'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { allowRoles, admin } = require('./accessControl')

const makeArgs = (operation: string, session?: unknown) => ({
  operation,
  session,
  listKey: 'Post',
  context: { req: { headers: {} } },
})

test('preview mode log: anonymous writes pass and are logged', async (t) => {
  process.env.ANONYMOUS_WRITE_MODE = 'log'
  const calls = t.mock.method(console, 'log', () => undefined)

  assert.equal(await allowRoles(admin)(makeArgs('update')), true)

  const logged = calls.mock.calls
    .map((c) => c.arguments.join(' '))
    .filter((l) => l.includes('[anonymous-write]'))
  assert.equal(logged.length, 1)
})

test('preview mode enforce: anonymous writes rejected, queries allowed', async () => {
  process.env.ANONYMOUS_WRITE_MODE = 'enforce'

  assert.equal(await allowRoles(admin)(makeArgs('update')), false)
  assert.equal(await allowRoles(admin)(makeArgs('query')), true)
})
