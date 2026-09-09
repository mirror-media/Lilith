import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import type { Server } from 'node:http'
import { createGoogleAuthMiniApp } from './mini-app'
import type { GoogleClient, GoogleIdentity } from './google'
import { STATE_COOKIE_NAME, unsealAuthState } from './state-cookie'
import type {
  GoogleAuthLogEvent,
  GoogleAuthOptions,
  KeystoneContext,
} from './types'

const stateSecret = 'state-secret-that-is-long-enough-1234567890'

function fakeGoogle(identity: Partial<GoogleIdentity>) {
  const calls: { codes: string[]; authUrlArgs: unknown[] } = {
    codes: [],
    authUrlArgs: [],
  }
  let lastNonce = ''
  const client: GoogleClient = {
    buildAuthUrl(args) {
      calls.authUrlArgs.push(args)
      lastNonce = args.nonce
      return `https://accounts.google.com/o/oauth2/v2/auth?state=${args.state}&nonce=${args.nonce}`
    },
    async exchangeCode(code) {
      calls.codes.push(code)
      if (code === 'bad') throw new Error('invalid_grant')
      return {
        email:
          identity.email === undefined ? 'a@mirrormedia.mg' : identity.email,
        emailVerified: identity.emailVerified ?? true,
        hd: identity.hd === undefined ? 'mirrormedia.mg' : identity.hd,
        nonce: identity.nonce === undefined ? lastNonce : identity.nonce,
      }
    },
  }
  return { client, calls }
}

function fakeKeystone(user: Record<string, unknown> | null) {
  const started: unknown[] = []
  const context: KeystoneContext = {
    sudo: () => ({
      query: { User: { findOne: async () => user } },
    }),
    async withRequest(_req, res) {
      return {
        sessionStrategy: {
          async start(args) {
            started.push(args.data)
            res.setHeader(
              'Set-Cookie',
              'keystonejs-session=sealed; Path=/; HttpOnly'
            )
            return 'sealed'
          },
        },
      }
    },
  }
  return { context, started }
}

async function withApp(
  options: Partial<GoogleAuthOptions> & { keystoneContext: KeystoneContext },
  google: GoogleClient,
  fn: (base: string, events: GoogleAuthLogEvent[]) => Promise<void>
) {
  const events: GoogleAuthLogEvent[] = []
  const app = express()
  app.use(
    createGoogleAuthMiniApp(
      {
        clientId: 'cid',
        clientSecret: 'sec',
        callbackUrl: 'http://127.0.0.1/auth/google/callback',
        allowedDomains: ['mirrormedia.mg'],
        stateSecret,
        logger: (e) => events.push(e),
        ...options,
      },
      { google }
    )
  )
  // Stand-ins for Keystone's own routes behind the mini-app.
  app.get('/signin', (_req, res) => res.send('KEYSTONE_SIGNIN'))
  app.post('/api/graphql', express.json(), (_req, res) =>
    res.json({ data: 'ok' })
  )
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  try {
    await fn(`http://127.0.0.1:${port}`, events)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

function cookieHeader(res: Response): string {
  const raw = res.headers.get('set-cookie') ?? ''
  return raw.split(';')[0]
}

test('GET /signin serves the custom page and passes through with ?password=1', async () => {
  const { context } = fakeKeystone(null)
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
    async (base) => {
      const page = await (await fetch(`${base}/signin?from=%2Fposts`)).text()
      assert.ok(page.includes('使用 Google 帳號登入'))
      assert.ok(page.includes('/signin?password=1&amp;from=%2Fposts'))
      const native = await (await fetch(`${base}/signin?password=1`)).text()
      assert.equal(native, 'KEYSTONE_SIGNIN')
    }
  )
})

test('password disabled: no pass-through and mutation blocked', async () => {
  const { context } = fakeKeystone(null)
  await withApp(
    { keystoneContext: context, passwordLoginEnabled: false },
    fakeGoogle({}).client,
    async (base) => {
      const page = await (await fetch(`${base}/signin?password=1`)).text()
      assert.ok(page.includes('使用 Google 帳號登入'))
      assert.ok(!page.includes('password=1'))
      const blocked = await fetch(`${base}/api/graphql`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query:
            'mutation { authenticateUserWithPassword(email:"a",password:"b"){__typename} }',
        }),
      })
      assert.equal(blocked.status, 403)
      const ok = await fetch(`${base}/api/graphql`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: 'mutation { createInitialUser(data:{}){__typename} }',
        }),
      })
      assert.equal(ok.status, 200)
    }
  )
})

test('password enabled: mutation is not blocked', async () => {
  const { context } = fakeKeystone(null)
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
    async (base) => {
      const ok = await fetch(`${base}/api/graphql`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query:
            'mutation { authenticateUserWithPassword(email:"a",password:"b"){__typename} }',
        }),
      })
      assert.equal(ok.status, 200)
    }
  )
})

test('GET /auth/google sets the state cookie and redirects to Google', async () => {
  const { context } = fakeKeystone(null)
  const google = fakeGoogle({})
  await withApp({ keystoneContext: context }, google.client, async (base) => {
    const res = await fetch(`${base}/auth/google?from=%2Fposts`, {
      redirect: 'manual',
    })
    assert.equal(res.status, 302)
    assert.match(
      res.headers.get('location') ?? '',
      /^https:\/\/accounts\.google\.com\//
    )
    const setCookie = res.headers.get('set-cookie') ?? ''
    assert.match(setCookie, new RegExp(`^${STATE_COOKIE_NAME}=`))
    assert.match(setCookie, /HttpOnly/)
    assert.match(setCookie, /SameSite=Lax/)
    assert.match(setCookie, /Max-Age=300/)
    const sealed = setCookie.split(';')[0].slice(STATE_COOKIE_NAME.length + 1)
    const state = unsealAuthState(decodeURIComponent(sealed), stateSecret)
    assert.ok(state)
    assert.equal(state?.from, '/posts')
    assert.deepEqual(google.calls.authUrlArgs[0], {
      state: state?.state,
      nonce: state?.nonce,
      hdHint: 'mirrormedia.mg',
    })
  })
})

test('GET /auth/google ignores an off-site from', async () => {
  const { context } = fakeKeystone(null)
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
    async (base) => {
      const res = await fetch(
        `${base}/auth/google?from=https%3A%2F%2Fevil.example`,
        { redirect: 'manual' }
      )
      const setCookie = res.headers.get('set-cookie') ?? ''
      const sealed = setCookie.split(';')[0].slice(STATE_COOKIE_NAME.length + 1)
      assert.equal(
        unsealAuthState(decodeURIComponent(sealed), stateSecret)?.from,
        '/'
      )
    }
  )
})

async function startFlow(
  base: string
): Promise<{ cookie: string; state: string }> {
  const res = await fetch(`${base}/auth/google?from=%2Fposts`, {
    redirect: 'manual',
  })
  const cookie = cookieHeader(res)
  const sealed = cookie.slice(STATE_COOKIE_NAME.length + 1)
  const state = unsealAuthState(decodeURIComponent(sealed), stateSecret)
  if (!state) throw new Error('no state')
  return { cookie, state: state.state }
}

test('callback signs in an existing user and redirects to from', async () => {
  const { context, started } = fakeKeystone({
    id: 7,
    email: 'a@mirrormedia.mg',
    name: 'A',
    role: 'editor',
  })
  const google = fakeGoogle({})
  await withApp(
    { keystoneContext: context },
    google.client,
    async (base, events) => {
      const { cookie, state } = await startFlow(base)
      const res = await fetch(
        `${base}/auth/google/callback?code=c1&state=${state}`,
        {
          redirect: 'manual',
          headers: { cookie },
        }
      )
      assert.equal(res.status, 302)
      assert.equal(res.headers.get('location'), '/posts')
      assert.deepEqual(started, [{ listKey: 'User', itemId: '7' }])
      assert.deepEqual(google.calls.codes, ['c1'])
      const setCookies = res.headers.getSetCookie()
      assert.ok(setCookies.some((c) => c.startsWith('keystonejs-session=')))
      assert.ok(
        setCookies.some(
          (c) => c.startsWith(`${STATE_COOKIE_NAME}=;`) && /Max-Age=0/.test(c)
        )
      )
      assert.equal(events.length, 1)
      assert.equal(events[0].outcome, 'success')
      assert.equal(events[0].id, '7')
      assert.equal(events[0].role, 'editor')
    }
  )
})

test('callback rejects a state mismatch', async () => {
  const { context, started } = fakeKeystone({ id: 7 })
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
    async (base, events) => {
      const { cookie } = await startFlow(base)
      const res = await fetch(
        `${base}/auth/google/callback?code=c1&state=wrong`,
        {
          redirect: 'manual',
          headers: { cookie },
        }
      )
      assert.equal(res.headers.get('location'), '/signin?error=state')
      assert.equal(started.length, 0)
      assert.equal(events[0].reason, 'state')
    }
  )
})

test('callback rejects a missing cookie', async () => {
  const { context } = fakeKeystone({ id: 7 })
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
    async (base) => {
      const res = await fetch(`${base}/auth/google/callback?code=c1&state=x`, {
        redirect: 'manual',
      })
      assert.equal(res.headers.get('location'), '/signin?error=state')
    }
  )
})

test('callback maps failures to error codes', async () => {
  const cases: {
    google: GoogleClient
    expected: string
    user?: Record<string, unknown> | null
  }[] = [
    { google: fakeGoogle({ hd: 'gmail.com' }).client, expected: 'domain' },
    { google: fakeGoogle({ hd: null }).client, expected: 'domain' },
    {
      google: fakeGoogle({ emailVerified: false }).client,
      expected: 'unverified_email',
    },
    { google: fakeGoogle({ nonce: 'other' }).client, expected: 'token' },
    { google: fakeGoogle({ email: null }).client, expected: 'token' },
    { google: fakeGoogle({}).client, expected: 'no_user', user: null },
  ]
  for (const c of cases) {
    const { context, started } = fakeKeystone(
      c.user === undefined ? { id: 7 } : c.user
    )
    await withApp(
      { keystoneContext: context },
      c.google,
      async (base, events) => {
        const { cookie, state } = await startFlow(base)
        const res = await fetch(
          `${base}/auth/google/callback?code=c1&state=${state}`,
          {
            redirect: 'manual',
            headers: { cookie },
          }
        )
        assert.equal(
          res.headers.get('location'),
          `/signin?error=${c.expected}`,
          c.expected
        )
        assert.equal(started.length, 0, c.expected)
        assert.equal(events[0].reason, c.expected)
      }
    )
  }
})

test('callback maps a token exchange failure to token', async () => {
  const { context } = fakeKeystone({ id: 7 })
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
    async (base) => {
      const { cookie, state } = await startFlow(base)
      const res = await fetch(
        `${base}/auth/google/callback?code=bad&state=${state}`,
        {
          redirect: 'manual',
          headers: { cookie },
        }
      )
      assert.equal(res.headers.get('location'), '/signin?error=token')
    }
  )
})

test('callback with a Google error param goes back to signin', async () => {
  const { context } = fakeKeystone({ id: 7 })
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
    async (base) => {
      const { cookie } = await startFlow(base)
      const res = await fetch(
        `${base}/auth/google/callback?error=access_denied`,
        {
          redirect: 'manual',
          headers: { cookie },
        }
      )
      assert.equal(res.headers.get('location'), '/signin?error=token')
    }
  )
})
