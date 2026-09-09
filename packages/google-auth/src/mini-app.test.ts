import test from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import type { Server } from 'node:http'
import { parse } from 'graphql'
// Same specifier Keystone core uses (see @keystone-6/core's
// createAdminUIMiddleware bundle), so this test exercises the real middleware.
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'
import { createGoogleAuthMiniApp } from './mini-app'
import { documentSelectsPasswordLogin } from './password-plugin'
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

/** A Keystone context whose User lookup throws, e.g. a DB/Prisma failure. */
function fakeKeystoneThrowing() {
  const started: unknown[] = []
  const context: KeystoneContext = {
    sudo: () => ({
      query: {
        User: {
          findOne: async () => {
            throw new Error('db unavailable')
          },
        },
      },
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
      assert.equal(events[0].userId, '7')
      assert.equal(events[0].role, 'editor')
      assert.equal(events[0].email, 'a@mirrormedia.mg')
      assert.equal(events[0].name, 'A')
      // Aligned with lilith-core's login-logging plugin.
      assert.equal(
        new Date(events[0].timestamp).toISOString(),
        events[0].timestamp
      )
      assert.equal(events[0].ipAddress, '127.0.0.1')
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

test('callback fails closed to session when the user lookup throws', async () => {
  const { context, started } = fakeKeystoneThrowing()
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
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
      assert.equal(res.headers.get('location'), '/signin?error=session')
      const setCookies = res.headers.getSetCookie()
      assert.ok(!setCookies.some((c) => c.startsWith('keystonejs-session=')))
      assert.ok(
        setCookies.some(
          (c) => c.startsWith(`${STATE_COOKIE_NAME}=;`) && /Max-Age=0/.test(c)
        )
      )
      assert.equal(started.length, 0)
      assert.equal(events.length, 1)
      assert.equal(events[0].outcome, 'failure')
      assert.equal(events[0].reason, 'session')
    }
  )
})

test('callback still redirects and clears the state cookie when the logger throws', async () => {
  const { context } = fakeKeystone({ id: 7 })
  await withApp(
    {
      keystoneContext: context,
      logger: () => {
        throw new Error('logger boom')
      },
    },
    fakeGoogle({}).client,
    async (base) => {
      const { cookie } = await startFlow(base)
      const res = await fetch(
        `${base}/auth/google/callback?code=c1&state=wrong`,
        {
          redirect: 'manual',
          headers: { cookie },
        }
      )
      assert.equal(res.status, 302)
      assert.equal(res.headers.get('location'), '/signin?error=state')
      const setCookies = res.headers.getSetCookie()
      assert.ok(
        setCookies.some(
          (c) => c.startsWith(`${STATE_COOKIE_NAME}=;`) && /Max-Age=0/.test(c)
        )
      )
    }
  )
})

const PASSWORD_MUTATION =
  'mutation { authenticateUserWithPassword(email:"a",password:"b"){__typename} }'

function baseOptions(
  overrides: Partial<GoogleAuthOptions> = {}
): GoogleAuthOptions {
  return {
    keystoneContext: fakeKeystone(null).context,
    clientId: 'cid',
    clientSecret: 'sec',
    callbackUrl: 'https://cms.example/auth/google/callback',
    allowedDomains: ['mirrormedia.mg'],
    stateSecret,
    ...overrides,
  }
}

test('rejects options that cannot produce a working flow', () => {
  const cases: { options: Partial<GoogleAuthOptions>; match: RegExp }[] = [
    { options: { clientId: '' }, match: /clientId/ },
    { options: { clientId: '   ' }, match: /clientId/ },
    { options: { clientSecret: '' }, match: /clientSecret/ },
    { options: { stateSecret: '' }, match: /stateSecret/ },
    { options: { stateSecret: 'a'.repeat(31) }, match: /32/ },
    { options: { allowedDomains: [] }, match: /allowedDomains/ },
    { options: { allowedDomains: ['', '  '] }, match: /allowedDomains/ },
    {
      options: { callbackUrl: '/auth/google/callback' },
      match: /callbackUrl/,
    },
    { options: { callbackUrl: 'ftp://cms.example/cb' }, match: /callbackUrl/ },
    { options: { callbackUrl: 'https://cms.example/' }, match: /callbackUrl/ },
    {
      options: { callbackUrl: 'https://cms.example/auth/:id/callback' },
      match: /callbackUrl/,
    },
  ]
  for (const c of cases) {
    assert.throws(
      () => createGoogleAuthMiniApp(baseOptions(c.options)),
      (err: unknown) => {
        assert.ok(err instanceof Error)
        assert.match(err.message, /^\[google-auth\] /)
        assert.match(err.message, c.match)
        return true
      },
      JSON.stringify(c.options)
    )
  }
})

test('accepts a valid option set', () => {
  assert.doesNotThrow(() => createGoogleAuthMiniApp(baseOptions()))
})

test('state cookie is scoped to the callback path and marked Secure on https', async () => {
  const { context } = fakeKeystone(null)
  const app = express()
  app.use(
    createGoogleAuthMiniApp(baseOptions({ keystoneContext: context }), {
      google: fakeGoogle({}).client,
    })
  )
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  try {
    const res = await fetch(`http://127.0.0.1:${port}/auth/google`, {
      redirect: 'manual',
    })
    const setCookie = res.headers.get('set-cookie') ?? ''
    assert.match(setCookie, /Path=\/auth\/google\/callback/)
    assert.match(setCookie, /Secure/)
    assert.equal(res.headers.get('cache-control'), 'no-store')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

test('state cookie is not Secure when the callback URL is http', async () => {
  const { context } = fakeKeystone(null)
  await withApp(
    { keystoneContext: context },
    fakeGoogle({}).client,
    async (base) => {
      const res = await fetch(`${base}/auth/google`, { redirect: 'manual' })
      const setCookie = res.headers.get('set-cookie') ?? ''
      assert.match(setCookie, /Path=\/auth\/google\/callback/)
      assert.ok(!/Secure/.test(setCookie))
    }
  )
})

test('callback clears the state cookie and sends no-store on the domain failure', async () => {
  const { context } = fakeKeystone({ id: 7 })
  await withApp(
    { keystoneContext: context },
    fakeGoogle({ hd: 'gmail.com' }).client,
    async (base) => {
      const { cookie, state } = await startFlow(base)
      const res = await fetch(
        `${base}/auth/google/callback?code=c1&state=${state}`,
        { redirect: 'manual', headers: { cookie } }
      )
      assert.equal(res.headers.get('location'), '/signin?error=domain')
      assert.equal(res.headers.get('cache-control'), 'no-store')
      const setCookies = res.headers.getSetCookie()
      assert.ok(
        setCookies.some(
          (c) => c.startsWith(`${STATE_COOKIE_NAME}=;`) && /Max-Age=0/.test(c)
        )
      )
    }
  )
})

test('log event prefers x-forwarded-for, then x-real-ip, then the socket', async () => {
  const cases: { headers: Record<string, string>; expected: string }[] = [
    {
      headers: {
        'x-forwarded-for': '203.0.113.5, 70.41.3.18',
        'x-real-ip': '198.51.100.7',
      },
      expected: '203.0.113.5',
    },
    { headers: { 'x-real-ip': '198.51.100.7' }, expected: '198.51.100.7' },
    { headers: {}, expected: '127.0.0.1' },
  ]
  for (const c of cases) {
    const { context } = fakeKeystone({ id: 7, email: 'a@mirrormedia.mg' })
    await withApp(
      { keystoneContext: context },
      fakeGoogle({}).client,
      async (base, events) => {
        const { cookie, state } = await startFlow(base)
        await fetch(`${base}/auth/google/callback?code=c1&state=${state}`, {
          redirect: 'manual',
          headers: { cookie, 'user-agent': 'test-agent', ...c.headers },
        })
        assert.equal(events[0].ipAddress, c.expected, JSON.stringify(c.headers))
        assert.equal(events[0].userAgent, 'test-agent')
      }
    )
  }
})

test('the HTTP guard honours a custom graphqlPath', async () => {
  const { context } = fakeKeystone(null)
  const app = express()
  app.use(
    createGoogleAuthMiniApp(
      baseOptions({
        keystoneContext: context,
        passwordLoginEnabled: false,
        graphqlPath: '/graphql',
      }),
      { google: fakeGoogle({}).client }
    )
  )
  app.post('/graphql', express.json(), (_req, res) => res.json({ data: 'ok' }))
  app.post('/api/graphql', express.json(), (_req, res) =>
    res.json({ data: 'ok' })
  )
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  const post = (path: string) =>
    fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: PASSWORD_MUTATION }),
    })
  try {
    assert.equal((await post('/graphql')).status, 403)
    // The default path is no longer guarded once graphqlPath is overridden.
    assert.equal((await post('/api/graphql')).status, 200)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})

/**
 * Reproduces Keystone core's middleware order: extendExpressApp (and therefore
 * this mini-app's HTTP guard) runs first, `graphqlUploadExpress` afterwards.
 * `blockAtApollo` stands in for createPasswordLoginBlockPlugin().
 */
async function withUploadStack(
  blockAtApollo: boolean,
  fn: (base: string) => Promise<void>
) {
  const { context } = fakeKeystone(null)
  const app = express()
  app.use(
    createGoogleAuthMiniApp(
      baseOptions({ keystoneContext: context, passwordLoginEnabled: false }),
      { google: fakeGoogle({}).client }
    )
  )
  app.use(graphqlUploadExpress())
  app.post('/api/graphql', (req, res) => {
    const query = (req.body as { query?: unknown } | undefined)?.query
    if (
      blockAtApollo &&
      typeof query === 'string' &&
      documentSelectsPasswordLogin(parse(query))
    ) {
      res.status(403).json({
        errors: [{ extensions: { code: 'PASSWORD_LOGIN_DISABLED' } }],
      })
      return
    }
    res.json({ data: 'ok' })
  })
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

function multipart(query: string): FormData {
  const form = new FormData()
  form.append('operations', JSON.stringify({ query, variables: {} }))
  form.append('map', '{}')
  return form
}

test('the HTTP guard alone cannot see a multipart password mutation', async () => {
  await withUploadStack(false, async (base) => {
    const json = await fetch(`${base}/api/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: PASSWORD_MUTATION }),
    })
    assert.equal(json.status, 403)
    const bypass = await fetch(`${base}/api/graphql`, {
      method: 'POST',
      body: multipart(PASSWORD_MUTATION),
    })
    // graphql-upload refills req.body after the guard has already passed it.
    assert.equal(bypass.status, 200)
  })
})

test('the document check closes the multipart bypass', async () => {
  await withUploadStack(true, async (base) => {
    const json = await fetch(`${base}/api/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: PASSWORD_MUTATION }),
    })
    assert.equal(json.status, 403)

    const blocked = await fetch(`${base}/api/graphql`, {
      method: 'POST',
      body: multipart(PASSWORD_MUTATION),
    })
    assert.equal(blocked.status, 403)
    const body = (await blocked.json()) as {
      errors: { extensions: { code: string } }[]
    }
    assert.equal(body.errors[0].extensions.code, 'PASSWORD_LOGIN_DISABLED')

    const harmless = await fetch(`${base}/api/graphql`, {
      method: 'POST',
      body: multipart('mutation { createInitialUser(data:{}){__typename} }'),
    })
    assert.equal(harmless.status, 200)
  })
})
