import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import type { Server } from 'node:http'
import {
  createPasswordLoginGuard,
  requestUsesPasswordLogin,
} from './password-guard'

test('detects the mutation in a single operation', () => {
  assert.equal(
    requestUsesPasswordLogin({
      query:
        'mutation { authenticateUserWithPassword(email: "a", password: "b") { __typename } }',
    }),
    true
  )
})

test('detects the mutation behind an alias', () => {
  assert.equal(
    requestUsesPasswordLogin({
      query:
        'mutation { login: authenticateUserWithPassword(email: "a", password: "b") { __typename } }',
    }),
    true
  )
})

test('detects the mutation inside a batched request', () => {
  assert.equal(
    requestUsesPasswordLogin([
      { query: '{ posts { id } }' },
      {
        query:
          'mutation { authenticateUserWithPassword(email: "a", password: "b") { __typename } }',
      },
    ]),
    true
  )
})

test('ignores unrelated operations and bad bodies', () => {
  assert.equal(
    requestUsesPasswordLogin({ query: '{ authenticatedItem { __typename } }' }),
    false
  )
  assert.equal(
    requestUsesPasswordLogin({
      query: 'mutation { createInitialUser(data: {}) { __typename } }',
    }),
    false
  )
  assert.equal(
    requestUsesPasswordLogin({
      query:
        '{ __type(name: "UserAuthenticationWithPasswordSuccess") { name } }',
    }),
    false
  )
  assert.equal(requestUsesPasswordLogin(undefined), false)
  assert.equal(requestUsesPasswordLogin('string'), false)
})

async function withServer(
  app: express.Express,
  fn: (base: string) => Promise<void>
) {
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  try {
    await fn(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

test('guard returns 403 for the mutation and passes everything else', async () => {
  const app = express()
  app.use('/api/graphql', ...createPasswordLoginGuard())
  app.post('/api/graphql', (_req, res) => res.json({ data: 'ok' }))
  app.get('/api/graphql', (_req, res) => res.json({ data: 'get' }))

  await withServer(app, async (base) => {
    const blocked = await fetch(`${base}/api/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query:
          'mutation { authenticateUserWithPassword(email: "a", password: "b") { __typename } }',
      }),
    })
    assert.equal(blocked.status, 403)
    const body = (await blocked.json()) as {
      errors: { extensions: { code: string } }[]
    }
    assert.equal(body.errors[0].extensions.code, 'PASSWORD_LOGIN_DISABLED')

    const allowed = await fetch(`${base}/api/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ posts { id } }' }),
    })
    assert.equal(allowed.status, 200)

    const get = await fetch(`${base}/api/graphql`)
    assert.equal(get.status, 200)
  })
})

test('guard reuses a body the host already parsed', async () => {
  const app = express()
  app.use(express.json())
  app.use('/api/graphql', ...createPasswordLoginGuard())
  app.post('/api/graphql', (_req, res) => res.json({ data: 'ok' }))

  await withServer(app, async (base) => {
    const blocked = await fetch(`${base}/api/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query:
          'mutation { authenticateUserWithPassword(email: "a", password: "b") { __typename } }',
      }),
    })
    assert.equal(blocked.status, 403)
  })
})
