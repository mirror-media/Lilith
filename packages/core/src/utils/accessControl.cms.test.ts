import test from 'node:test'
import assert from 'node:assert/strict'

process.env.ACCESS_CONTROL_STRATEGY = 'cms'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { allowRoles, admin } = require('./accessControl')

const makeArgs = (operation: string, session?: unknown) => ({
  operation,
  session,
  listKey: 'Post',
  context: { req: { headers: {} } },
})

test('cms mode is unchanged: anonymous writes are rejected whatever the mode flag says', async (t) => {
  const calls = t.mock.method(console, 'log', () => undefined)

  for (const mode of [undefined, 'off', 'log', 'enforce']) {
    if (mode === undefined) delete process.env.ANONYMOUS_WRITE_MODE
    else process.env.ANONYMOUS_WRITE_MODE = mode
    assert.equal(await allowRoles(admin)(makeArgs('create')), false)
  }

  const logged = calls.mock.calls
    .map((c) => c.arguments.join(' '))
    .filter((l) => l.includes('[anonymous-write]'))
  assert.equal(logged.length, 0)
})

test('cms mode is unchanged: a matching role is allowed', async () => {
  delete process.env.ANONYMOUS_WRITE_MODE
  const session = { data: { role: 'admin' } }

  assert.equal(await allowRoles(admin)(makeArgs('create', session)), true)
})
