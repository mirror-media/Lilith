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

export function createGoogleAuthMiniApp(
  options: GoogleAuthOptions,
  deps: GoogleAuthDependencies = {}
): Router {
  const passwordLoginEnabled = options.passwordLoginEnabled !== false
  const redirectDefault = options.signinRedirectDefault ?? '/'
  const allowedDomains = options.allowedDomains.map((d) => d.toLowerCase())
  const log = options.logger ?? defaultLogger
  const google =
    deps.google ??
    createGoogleClient({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      callbackUrl: options.callbackUrl,
    })
  const callbackPath = new URL(options.callbackUrl).pathname
  const secureCookie = options.callbackUrl.startsWith('https://')

  const router = Router()

  if (!passwordLoginEnabled) {
    router.use('/api/graphql', ...createPasswordLoginGuard())
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
      .send(renderSigninPage({ passwordLoginEnabled, from, error }))
  })

  router.get('/auth/google', (req, res) => {
    const from = sanitizeRedirectPath(req.query.from, redirectDefault)
    const state = createAuthState(from)
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
    const clearState = serializeCookie(STATE_COOKIE_NAME, '', {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: callbackPath,
      maxAge: 0,
    })
    const fail = (reason: GoogleAuthErrorCode, email: string | null) => {
      log(buildEvent(req, { outcome: 'failure', reason, email }))
      res.setHeader('Set-Cookie', clearState)
      res.redirect(302, `/signin?error=${reason}`)
    }

    const cookies = parseCookies(req.headers.cookie ?? '')
    const state = unsealAuthState(
      cookies[STATE_COOKIE_NAME],
      options.stateSecret
    )
    if (!state) return fail('state', null)
    if (typeof req.query.error === 'string') return fail('token', null)
    if (
      typeof req.query.state !== 'string' ||
      req.query.state !== state.state
    ) {
      return fail('state', null)
    }
    if (typeof req.query.code !== 'string' || req.query.code.length === 0) {
      return fail('token', null)
    }

    let identity: GoogleIdentity
    try {
      identity = await google.exchangeCode(req.query.code)
    } catch {
      return fail('token', null)
    }
    if (!identity.email || identity.nonce !== state.nonce)
      return fail('token', identity.email)
    if (!identity.emailVerified) return fail('unverified_email', identity.email)
    if (!identity.hd || !allowedDomains.includes(identity.hd.toLowerCase())) {
      return fail('domain', identity.email)
    }

    const result = await signInByEmail(
      options.keystoneContext,
      req,
      res,
      identity.email
    )
    if (!result.ok) return fail(result.reason, identity.email)

    log(
      buildEvent(req, {
        outcome: 'success',
        email: result.user.email ?? identity.email,
        id: result.user.id,
        name: result.user.name,
        role: result.user.role,
      })
    )
    // sessionStrategy.start() already set the session cookie; append the clear.
    appendSetCookie(res, clearState)
    res.redirect(302, sanitizeRedirectPath(state.from, redirectDefault))
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

function buildEvent(
  req: Request,
  fields: Partial<GoogleAuthLogEvent> &
    Pick<GoogleAuthLogEvent, 'outcome' | 'email'>
): GoogleAuthLogEvent {
  const forwarded = req.headers['x-forwarded-for']
  const ip =
    (typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : undefined) ||
    req.socket?.remoteAddress ||
    null
  const userAgent = req.headers['user-agent'] ?? null
  return {
    type: 'google-login',
    id: null,
    name: null,
    role: null,
    ip,
    userAgent,
    ...fields,
  }
}

function defaultLogger(event: GoogleAuthLogEvent) {
  // Same prefix as lilith-core's login-logging plugin so log queries match.
  console.log('[登入日誌]', event)
}
