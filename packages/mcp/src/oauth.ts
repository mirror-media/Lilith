import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

const CODE_TTL_MS = 5 * 60 * 1000

/**
 * Per-package OAuth configuration. Every value a CMS package previously
 * hard-coded in its own oauth implementation lives here, so the protocol
 * logic below stays identical across packages.
 */
export type OAuthConfig = {
  /** Full scope list, e.g. ['readr.posts.read', ...]. First entry is the default authorize scope unless defaultScope is set. */
  scopes: string[]
  /** Prefix for issued client ids, e.g. 'readr_'. */
  clientIdPrefix: string
  /** Roles allowed to hold a valid access token. */
  tokenRoles: string[]
  /** Roles allowed to grant authorization codes. */
  authorizeRoles: string[]
  /** Canonical authorization-server base URL. OAuth is disabled while unset. */
  issuer?: string
  /** HS256 signing secret (>= 32 chars). OAuth is disabled while unset. */
  signingSecret?: string
  accessTokenTtlSeconds: number
  /** Canonical MCP resource URL for RFC 9728 metadata. */
  resourceUrl?: string
  /** Human-readable resource name in protected-resource metadata. */
  resourceName: string
  /** error_description shown when authorize is hit without a session. */
  signInHint: string
  defaultScope?: string
}

export type AccessTokenClaims = {
  sub: string
  name: string
  role: string
  scope: string[]
  aud: string
  iss: string
  exp: number
}

/** Structural subset of the Express request used by the OAuth endpoints. */
export type OAuthRequest = {
  body?: unknown
  query?: Record<string, unknown>
  headers?: Record<string, string | string[] | undefined>
  protocol?: string
  get?: (name: string) => string | undefined
}

/** Structural subset of the Express response used by the OAuth endpoints. */
export type OAuthResponse = {
  status: (status: number) => OAuthResponse
  json: (body: unknown) => unknown
  redirect: (url: string) => unknown
}

export type OAuthNext = (error?: unknown) => void

type OAuthUser = { id: string; name: string; role: string }
type OAuthClientRecord = {
  id: string
  clientId: string
  redirectUris: unknown
  allowedScopes: unknown
  isActive: boolean
}
type OAuthCodeRecord = {
  id: string
  redirectUri: string
  codeChallenge: string
  scope: string
  expiresAt: string
  usedAt?: string | null
  client: OAuthClientRecord
  user: OAuthUser
}

/**
 * Structural Keystone context: the OAuth endpoints only touch the
 * OAuthClient / OAuthAuthorizationCode / User lists through `sudo().query`.
 */
export type OAuthKeystoneContext = {
  session?: { itemId?: string; data?: { name?: string; role?: string } }
  query: Record<
    string,
    {
      findOne?: (args: Record<string, unknown>) => Promise<unknown>
      createOne?: (args: Record<string, unknown>) => Promise<unknown>
      updateOne?: (args: Record<string, unknown>) => Promise<unknown>
    }
  >
  sudo: () => OAuthKeystoneContext
}

export type OAuthCommonContext = {
  // Bivariant on purpose: Keystone's generated context accepts its own
  // concrete Request/Response types without imposing Express on this package.
  withRequest(
    request: OAuthRequest,
    response: OAuthResponse
  ): Promise<OAuthKeystoneContext>
}

function getSingle(value: unknown) {
  return typeof value === 'string' && value ? value : undefined
}

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('base64url')
}

function hashCode(code: string) {
  return createHash('sha256').update(code).digest('hex')
}

export function isOAuthConfigured(config: OAuthConfig) {
  return Boolean(config.issuer && config.signingSecret)
}

function oauthError(
  response: OAuthResponse,
  error: string,
  description: string,
  status = 400
) {
  return response.status(status).json({ error, error_description: description })
}

function redirectError(redirectUri: string, error: string, state?: string) {
  const destination = new URL(redirectUri)
  destination.searchParams.set('error', error)
  if (state) destination.searchParams.set('state', state)
  return destination.toString()
}

function stringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : []
}

function isValidRedirectUri(value: string) {
  try {
    const url = new URL(value)
    if (url.hash) return false
    // Native OAuth clients commonly use a claimed custom scheme (for example,
    // `com.example.app:/oauth/callback`) instead of an HTTPS callback.
    if (!['http:', 'https:'].includes(url.protocol)) {
      return !['data:', 'file:', 'javascript:'].includes(url.protocol)
    }
    return (
      url.protocol === 'https:' ||
      (url.protocol === 'http:' &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1'))
    )
  } catch {
    return false
  }
}

function signAccessToken(
  config: OAuthConfig,
  claims: Omit<AccessTokenClaims, 'iss' | 'exp'>
) {
  const now = Math.floor(Date.now() / 1000)
  const payload: AccessTokenClaims = {
    ...claims,
    iss: config.issuer as string,
    exp: now + config.accessTokenTtlSeconds,
  }
  const encodedHeader = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const encodedPayload = base64url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = createHmac('sha256', config.signingSecret as string)
    .update(signingInput)
    .digest('base64url')
  return `${signingInput}.${signature}`
}

/**
 * Returns a stateless verifier bound to the package's OAuth config.
 */
export function createAccessTokenVerifier(config: OAuthConfig) {
  const supported = new Set(config.scopes)
  return function verifyAccessToken(token: string): AccessTokenClaims | null {
    if (!isOAuthConfigured(config)) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [encodedHeader, encodedPayload, signature] = parts
    const expected = createHmac('sha256', config.signingSecret as string)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')
    const actualBytes = Buffer.from(signature)
    const expectedBytes = Buffer.from(expected)
    if (
      actualBytes.length !== expectedBytes.length ||
      !timingSafeEqual(actualBytes, expectedBytes)
    )
      return null

    try {
      const header = JSON.parse(
        Buffer.from(encodedHeader, 'base64url').toString()
      )
      const claims = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString()
      ) as AccessTokenClaims
      if (
        header.alg !== 'HS256' ||
        header.typ !== 'JWT' ||
        claims.iss !== config.issuer ||
        !claims.sub ||
        !claims.name ||
        !config.tokenRoles.includes(claims.role) ||
        !Array.isArray(claims.scope) ||
        claims.scope.some((scope) => !supported.has(scope)) ||
        !Number.isInteger(claims.exp) ||
        claims.exp <= Math.floor(Date.now() / 1000)
      )
        return null
      return claims
    } catch {
      return null
    }
  }
}

async function findClient(context: OAuthKeystoneContext, clientId: string) {
  return (await context.sudo().query.OAuthClient.findOne?.({
    where: { clientId },
    query: 'id clientId redirectUris allowedScopes isActive',
  })) as OAuthClientRecord | null
}

/**
 * Creates the five OAuth endpoints (AS metadata, protected-resource metadata,
 * dynamic client registration, authorize, token) for one CMS package.
 * Storage is the package's own OAuthClient / OAuthAuthorizationCode lists.
 */
export function createOAuthEndpoints(
  commonContext: OAuthCommonContext,
  config: OAuthConfig
) {
  const supported = new Set(config.scopes)
  const configured = () => isOAuthConfigured(config)
  const filterScopes = (value: unknown) => {
    if (
      !Array.isArray(value) ||
      !value.every((scope) => typeof scope === 'string')
    )
      return []
    return value.filter((scope) => supported.has(scope))
  }

  const metadata = (_request: OAuthRequest, response: OAuthResponse) => {
    if (!configured())
      return oauthError(
        response,
        'server_error',
        'OAuth is not configured',
        503
      )
    const issuer = (config.issuer as string).replace(/\/$/, '')
    return response.json({
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      registration_endpoint: `${issuer}/oauth/register`,
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      scopes_supported: [...supported],
    })
  }

  const register = async (
    request: OAuthRequest,
    response: OAuthResponse,
    next: OAuthNext
  ) => {
    try {
      if (!configured())
        return oauthError(
          response,
          'server_error',
          'OAuth is not configured',
          503
        )
      const body = (request.body || {}) as Record<string, unknown>
      const redirectUris = stringArray(body.redirect_uris)
      const clientName = getSingle(body.client_name) || 'Dynamic OAuth client'
      const scopeValue = getSingle(body.scope)
      const requestedScopes = scopeValue
        ? scopeValue.split(' ').filter(Boolean)
        : [...supported]
      const tokenEndpointAuthMethod =
        getSingle(body.token_endpoint_auth_method) || 'none'
      const grantTypes = stringArray(body.grant_types)
      const responseTypes = stringArray(body.response_types)
      if (
        redirectUris.length === 0 ||
        redirectUris.some((uri) => !isValidRedirectUri(uri)) ||
        requestedScopes.length === 0 ||
        requestedScopes.some((scope) => !supported.has(scope)) ||
        tokenEndpointAuthMethod !== 'none' ||
        (grantTypes.length > 0 && !grantTypes.includes('authorization_code')) ||
        (responseTypes.length > 0 && !responseTypes.includes('code'))
      ) {
        return oauthError(
          response,
          'invalid_client_metadata',
          'A public client needs valid redirect_uris, supported scopes, authorization_code, and token_endpoint_auth_method=none'
        )
      }
      const clientId = `${config.clientIdPrefix}${randomBytes(24).toString(
        'base64url'
      )}`
      const context = await commonContext.withRequest(request, response)
      await context.sudo().query.OAuthClient.createOne?.({
        data: {
          name: clientName,
          clientId,
          redirectUris,
          allowedScopes: requestedScopes,
          isActive: true,
        },
      })
      return response.status(201).json({
        client_id: clientId,
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_name: clientName,
        redirect_uris: redirectUris,
        grant_types: ['authorization_code'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
        scope: requestedScopes.join(' '),
      })
    } catch (error) {
      next(error)
    }
  }

  const protectedResourceMetadata = (
    request: OAuthRequest,
    response: OAuthResponse
  ) => {
    if (!configured())
      return oauthError(
        response,
        'server_error',
        'OAuth is not configured',
        503
      )
    const requestOrigin = `${request.protocol || 'http'}://${
      request.get?.('host') || 'localhost'
    }`
    const resource = config.resourceUrl || `${requestOrigin}/mcp`
    return response.json({
      resource,
      authorization_servers: [(config.issuer as string).replace(/\/$/, '')],
      scopes_supported: [...supported],
      bearer_methods_supported: ['header'],
      resource_name: config.resourceName,
    })
  }

  const authorize = async (
    request: OAuthRequest,
    response: OAuthResponse,
    next: OAuthNext
  ) => {
    try {
      if (!configured())
        return oauthError(
          response,
          'server_error',
          'OAuth is not configured',
          503
        )
      const query = request.query || {}
      const clientId = getSingle(query.client_id)
      const redirectUri = getSingle(query.redirect_uri)
      const responseType = getSingle(query.response_type)
      const challenge = getSingle(query.code_challenge)
      const method = getSingle(query.code_challenge_method)
      const state = getSingle(query.state)
      const requestedScopes = (
        getSingle(query.scope) ||
        config.defaultScope ||
        config.scopes[0]
      ).split(' ')
      if (
        !clientId ||
        !redirectUri ||
        responseType !== 'code' ||
        !challenge ||
        method !== 'S256'
      ) {
        return oauthError(
          response,
          'invalid_request',
          'client_id, redirect_uri, response_type=code, and S256 PKCE are required'
        )
      }
      const context = await commonContext.withRequest(request, response)
      const client = await findClient(context, clientId)
      if (
        !client?.isActive ||
        !stringArray(client.redirectUris).includes(redirectUri)
      ) {
        return oauthError(
          response,
          'invalid_request',
          'Unknown client or redirect URI'
        )
      }
      const allowedScopes = filterScopes(client.allowedScopes)
      if (
        !requestedScopes.length ||
        requestedScopes.some((scope) => !allowedScopes.includes(scope))
      ) {
        return response.redirect(
          redirectError(redirectUri, 'invalid_scope', state)
        )
      }
      const userId = context.session?.itemId
      if (
        !userId ||
        !context.session?.data?.role ||
        !context.session.data.name
      ) {
        return oauthError(response, 'login_required', config.signInHint, 401)
      }
      const user = (await context.sudo().query.User.findOne?.({
        where: { id: userId },
        query: 'id name role',
      })) as OAuthUser | null
      if (!user || !config.authorizeRoles.includes(user.role)) {
        return response.redirect(
          redirectError(redirectUri, 'access_denied', state)
        )
      }
      const code = randomBytes(32).toString('base64url')
      await context.sudo().query.OAuthAuthorizationCode.createOne?.({
        data: {
          codeHash: hashCode(code),
          client: { connect: { id: client.id } },
          user: { connect: { id: user.id } },
          redirectUri,
          codeChallenge: challenge,
          scope: requestedScopes.join(' '),
          expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
        },
      })
      const destination = new URL(redirectUri)
      destination.searchParams.set('code', code)
      if (state) destination.searchParams.set('state', state)
      return response.redirect(destination.toString())
    } catch (error) {
      next(error)
    }
  }

  const token = async (
    request: OAuthRequest,
    response: OAuthResponse,
    next: OAuthNext
  ) => {
    try {
      if (!configured())
        return oauthError(
          response,
          'server_error',
          'OAuth is not configured',
          503
        )
      const body = (request.body || {}) as Record<string, unknown>
      const grantType = getSingle(body.grant_type)
      const code = getSingle(body.code)
      const verifier = getSingle(body.code_verifier)
      const clientId = getSingle(body.client_id)
      const redirectUri = getSingle(body.redirect_uri)
      if (
        grantType !== 'authorization_code' ||
        !code ||
        !verifier ||
        !clientId ||
        !redirectUri
      ) {
        return oauthError(
          response,
          'invalid_request',
          'authorization_code grant with code, verifier, client_id and redirect_uri is required'
        )
      }
      const context = await commonContext.withRequest(request, response)
      const record = (await context
        .sudo()
        .query.OAuthAuthorizationCode.findOne?.({
          where: { codeHash: hashCode(code) },
          query:
            'id redirectUri codeChallenge scope expiresAt usedAt client { id clientId redirectUris allowedScopes isActive } user { id name role }',
        })) as OAuthCodeRecord | null
      if (
        !record ||
        record.usedAt ||
        !record.client.isActive ||
        record.client.clientId !== clientId ||
        record.redirectUri !== redirectUri ||
        new Date(record.expiresAt).getTime() <= Date.now() ||
        sha256(verifier) !== record.codeChallenge
      ) {
        return oauthError(
          response,
          'invalid_grant',
          'Authorization code is invalid, expired, or already used'
        )
      }
      await context.sudo().query.OAuthAuthorizationCode.updateOne?.({
        where: { id: record.id },
        data: { usedAt: new Date().toISOString() },
      })
      const scope = record.scope
        .split(' ')
        .filter((value) => supported.has(value))
      const accessToken = signAccessToken(config, {
        sub: record.user.id,
        name: record.user.name,
        role: record.user.role,
        scope,
        aud: record.client.clientId,
      })
      return response.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: config.accessTokenTtlSeconds,
        scope: scope.join(' '),
      })
    } catch (error) {
      next(error)
    }
  }

  return { metadata, protectedResourceMetadata, register, authorize, token }
}
