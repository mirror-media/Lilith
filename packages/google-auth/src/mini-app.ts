import { Router } from 'express'
import type { Request, Response } from 'express'
import { parse as parseCookies, serialize as serializeCookie } from 'cookie'
import { createGoogleClient } from './google'
import type { GoogleClient, GoogleIdentity } from './google'
import { createPasswordLoginGuard } from './password-guard'
import { sanitizeRedirectPath } from './redirect'
import { signInByEmail } from './session'
import { renderSigninPage } from './signin-page'
import {
  STATE_COOKIE_NAME,
  STATE_TTL_SECONDS,
  createAuthState,
  sealAuthState,
  unsealAuthState,
} from './state-cookie'
import type {
  GoogleAuthErrorCode,
  GoogleAuthLogEvent,
  GoogleAuthOptions,
} from './types'

export type GoogleAuthDependencies = {
  /** Test seam; production callers omit this. */
  google?: GoogleClient
}

/** Express path syntax that would silently turn callbackPath into a pattern. */
const PATH_PATTERN_CHARS = /[:()*?+]/

/**
 * The mini-app is mounted before the host's own middleware (see
 * withGoogleAuth), so it cannot inherit a host X-Robots-Tag middleware and
 * stamps its own pages instead. Pass-through and guard responses are left
 * alone: those belong to the host.
 */
const ROBOTS_TAG = 'noindex, nofollow, noimageindex'

function fail(reason: string): never {
  throw new Error(`[google-auth] ${reason}`)
}

/**
 * Fails fast on an option set that cannot produce a working flow. A CMS that
 * boots with a broken sign-in is worse than one that refuses to boot.
 */
function validateOptions(options: GoogleAuthOptions): {
  allowedDomains: string[]
  callbackPath: string
} {
  if (!options.clientId?.trim()) fail('clientId is required')
  if (!options.clientSecret?.trim()) fail('clientSecret is required')
  if (!options.stateSecret?.trim()) fail('stateSecret is required')
  if (options.stateSecret.length < 32) {
    fail('stateSecret must be at least 32 characters')
  }

  const allowedDomains = (options.allowedDomains ?? [])
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean)
  if (allowedDomains.length === 0) {
    fail('allowedDomains must list at least one Workspace domain')
  }

  let callbackUrl: URL
  try {
    callbackUrl = new URL(options.callbackUrl)
  } catch {
    fail(`callbackUrl must be an absolute URL, got ${options.callbackUrl}`)
  }
  if (callbackUrl.protocol !== 'http:' && callbackUrl.protocol !== 'https:') {
    fail(`callbackUrl must be http(s), got ${callbackUrl.protocol}`)
  }
  const callbackPath = callbackUrl.pathname
  if (callbackPath === '/' || PATH_PATTERN_CHARS.test(callbackPath)) {
    fail(`callbackUrl path is not usable as a route: ${callbackPath}`)
  }

  return { allowedDomains, callbackPath }
}

export function createGoogleAuthMiniApp(
  options: GoogleAuthOptions,
  deps: GoogleAuthDependencies = {}
): Router {
  const { allowedDomains, callbackPath } = validateOptions(options)
  const passwordLoginEnabled = options.passwordLoginEnabled !== false
  const graphqlPath = options.graphqlPath ?? '/api/graphql'
  const redirectDefault = options.signinRedirectDefault ?? '/'
  const log = options.logger ?? defaultLogger
  const google =
    deps.google ??
    createGoogleClient({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      callbackUrl: options.callbackUrl,
    })
  const secureCookie = options.callbackUrl.startsWith('https://')

  const router = Router()

  if (!passwordLoginEnabled) {
    // First of two layers. This one never sees a multipart request, so the
    // host must also register createPasswordLoginBlockPlugin() (see README).
    router.use(graphqlPath, ...createPasswordLoginGuard())
  }

  router.get('/signin', (req, res, next) => {
    if (passwordLoginEnabled && req.query.password === '1') return next()
    const from = typeof req.query.from === 'string' ? req.query.from : undefined
    const error =
      typeof req.query.error === 'string' ? req.query.error : undefined
    res
      .status(200)
      .type('html')
      .set('Cache-Control', 'no-store')
      .set('X-Robots-Tag', ROBOTS_TAG)
      .send(renderSigninPage({ passwordLoginEnabled, from, error }))
  })

  router.get('/auth/google', (req, res) => {
    const from = sanitizeRedirectPath(req.query.from, redirectDefault)
    const state = createAuthState(from)
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Robots-Tag', ROBOTS_TAG)
    res.setHeader(
      'Set-Cookie',
      serializeCookie(
        STATE_COOKIE_NAME,
        sealAuthState(state, options.stateSecret),
        {
          httpOnly: true,
          secure: secureCookie,
          sameSite: 'lax',
          path: callbackPath,
          maxAge: STATE_TTL_SECONDS,
        }
      )
    )
    res.redirect(
      302,
      google.buildAuthUrl({
        state: state.state,
        nonce: state.nonce,
        hdHint: allowedDomains.length === 1 ? allowedDomains[0] : undefined,
      })
    )
  })

  router.get(callbackPath, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Robots-Tag', ROBOTS_TAG)
    const clearState = serializeCookie(STATE_COOKIE_NAME, '', {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: callbackPath,
      maxAge: 0,
    })
    // A caller-supplied logger must never be able to block the redirect or
    // the state-cookie clear that follow it.
    const safeLog = (event: GoogleAuthLogEvent) => {
      try {
        log(event)
      } catch (err) {
        console.error('[google-auth] logger threw, ignoring', err)
      }
    }
    const failWith = (reason: GoogleAuthErrorCode, email: string | null) => {
      safeLog(buildEvent(req, { outcome: 'failure', reason, email }))
      res.setHeader('Set-Cookie', clearState)
      res.redirect(302, `/signin?error=${reason}`)
    }

    const cookies = parseCookies(req.headers.cookie ?? '')
    const state = unsealAuthState(
      cookies[STATE_COOKIE_NAME],
      options.stateSecret
    )
    if (!state) return failWith('state', null)

    // Everything below can call out to Google, Keystone/Prisma, or a
    // caller-supplied logger. Express 4 does not route a rejected async
    // handler's promise to the error middleware, so any unexpected throw
    // here must be caught and fail closed rather than hang the request or
    // crash the process.
    let email: string | null = null
    try {
      if (typeof req.query.error === 'string') return failWith('token', null)
      if (
        typeof req.query.state !== 'string' ||
        req.query.state !== state.state
      ) {
        return failWith('state', null)
      }
      if (typeof req.query.code !== 'string' || req.query.code.length === 0) {
        return failWith('token', null)
      }

      let identity: GoogleIdentity
      try {
        identity = await google.exchangeCode(req.query.code)
      } catch {
        return failWith('token', null)
      }
      email = identity.email
      if (!identity.email || identity.nonce !== state.nonce)
        return failWith('token', identity.email)
      if (!identity.emailVerified)
        return failWith('unverified_email', identity.email)
      if (!identity.hd || !allowedDomains.includes(identity.hd.toLowerCase())) {
        return failWith('domain', identity.email)
      }

      const result = await signInByEmail(
        options.keystoneContext,
        req,
        res,
        identity.email
      )
      if (!result.ok) return failWith(result.reason, identity.email)

      safeLog(
        buildEvent(req, {
          outcome: 'success',
          email: result.user.email ?? identity.email,
          userId: result.user.id,
          name: result.user.name,
          role: result.user.role,
        })
      )
      // sessionStrategy.start() already set the session cookie; append the clear.
      appendSetCookie(res, clearState)
      res.redirect(302, sanitizeRedirectPath(state.from, redirectDefault))
    } catch (err) {
      console.error('[google-auth] unexpected error in OAuth callback', err)
      return failWith('session', email)
    }
  })

  return router
}

function appendSetCookie(res: Response, value: string) {
  const existing = res.getHeader('Set-Cookie')
  const list = Array.isArray(existing)
    ? existing.map(String)
    : existing
    ? [String(existing)]
    : []
  res.setHeader('Set-Cookie', [...list, value])
}

/** Same precedence and IPv6-localhost normalisation as lilith-core. */
function clientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for']
  const realIp = req.headers['x-real-ip']
  const ip =
    (typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : undefined) ||
    (typeof realIp === 'string' ? realIp.trim() : undefined) ||
    req.socket?.remoteAddress ||
    null
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1'
  return ip
}

function buildEvent(
  req: Request,
  fields: Partial<GoogleAuthLogEvent> &
    Pick<GoogleAuthLogEvent, 'outcome' | 'email'>
): GoogleAuthLogEvent {
  const userAgent = req.headers['user-agent'] ?? null
  return {
    type: 'google-login',
    timestamp: new Date().toISOString(),
    userId: null,
    name: null,
    role: null,
    ipAddress: clientIp(req),
    userAgent,
    ...fields,
  }
}

function defaultLogger(event: GoogleAuthLogEvent) {
  // Same prefix as lilith-core's login-logging plugin so log queries match.
  console.log('[登入日誌]', event)
}
