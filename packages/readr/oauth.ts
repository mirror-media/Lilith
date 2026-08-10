import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import envVar from './environment-variables'

const CODE_TTL_MS = 5 * 60 * 1000
const SUPPORTED_SCOPES = new Set([
  'readr.posts.read',
  'readr.posts.write',
  'readr.posts.publish',
])

type OAuthUser = { id: string; name: string; role: string }
type OAuthClient = {
  id: string
  clientId: string
  redirectUris: unknown
  allowedScopes: unknown
  isActive: boolean
}
type OAuthCode = {
  id: string
  redirectUri: string
  codeChallenge: string
  scope: string
  expiresAt: string
  usedAt?: string | null
  client: OAuthClient
  user: OAuthUser
}

type Context = {
  session?: { itemId?: string; data?: { name?: string; role?: string } }
  query: Record<string, {
    findOne?: (args: Record<string, unknown>) => Promise<unknown>
    createOne?: (args: Record<string, unknown>) => Promise<unknown>
    updateOne?: (args: Record<string, unknown>) => Promise<unknown>
  }>
  sudo: () => Context
}

export type CommonContext = {
  withRequest: (request: Request, response: Response) => Promise<Context>
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

function configured() {
  return Boolean(envVar.oauth.issuer && envVar.oauth.signingSecret)
}

function oauthError(
  response: Response,
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

function scopes(value: unknown) {
  if (!Array.isArray(value) || !value.every((scope) => typeof scope === 'string')) return []
  return value.filter((scope) => SUPPORTED_SCOPES.has(scope))
}

function stringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : []
}

function signAccessToken(claims: Omit<AccessTokenClaims, 'iss' | 'exp'>) {
  const now = Math.floor(Date.now() / 1000)
  const payload: AccessTokenClaims = {
    ...claims,
    iss: envVar.oauth.issuer!,
    exp: now + envVar.oauth.accessTokenTtlSeconds,
  }
  const encodedHeader = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const encodedPayload = base64url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = createHmac('sha256', envVar.oauth.signingSecret!)
    .update(signingInput)
    .digest('base64url')
  return `${signingInput}.${signature}`
}

export function verifyAccessToken(token: string): AccessTokenClaims | null {
  if (!configured()) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [encodedHeader, encodedPayload, signature] = parts
  const expected = createHmac('sha256', envVar.oauth.signingSecret!)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')
  const actualBytes = Buffer.from(signature)
  const expectedBytes = Buffer.from(expected)
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString())
    const claims = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as AccessTokenClaims
    if (
      header.alg !== 'HS256' ||
      header.typ !== 'JWT' ||
      claims.iss !== envVar.oauth.issuer ||
      !claims.sub ||
      !claims.name ||
      !['admin', 'moderator', 'editor', 'contributor'].includes(claims.role) ||
      !Array.isArray(claims.scope) ||
      claims.scope.some((scope) => !SUPPORTED_SCOPES.has(scope)) ||
      !Number.isInteger(claims.exp) ||
      claims.exp <= Math.floor(Date.now() / 1000)
    ) return null
    return claims
  } catch {
    return null
  }
}

async function findClient(context: Context, clientId: string) {
  return (await context.sudo().query.OAuthClient.findOne?.({
    where: { clientId },
    query: 'id clientId redirectUris allowedScopes isActive',
  })) as OAuthClient | null
}

export function createOAuthHandlers(commonContext: CommonContext) {
  const metadata = (_request: Request, response: Response) => {
    if (!configured()) return oauthError(response, 'server_error', 'OAuth is not configured', 503)
    const issuer = envVar.oauth.issuer!.replace(/\/$/, '')
    return response.json({
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      scopes_supported: [...SUPPORTED_SCOPES],
    })
  }
  const protectedResourceMetadata = (request: Request, response: Response) => {
    if (!configured()) return oauthError(response, 'server_error', 'OAuth is not configured', 503)
    const requestOrigin = `${request.protocol}://${request.get('host')}`
    const resource = envVar.oauth.resourceUrl || `${requestOrigin}/mcp`
    return response.json({
      resource,
      authorization_servers: [envVar.oauth.issuer!.replace(/\/$/, '')],
      scopes_supported: [...SUPPORTED_SCOPES],
      bearer_methods_supported: ['header'],
      resource_name: 'READr CMS MCP',
    })
  }
  const authorize = async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!configured()) return oauthError(response, 'server_error', 'OAuth is not configured', 503)
      const clientId = getSingle(request.query.client_id)
      const redirectUri = getSingle(request.query.redirect_uri)
      const responseType = getSingle(request.query.response_type)
      const challenge = getSingle(request.query.code_challenge)
      const method = getSingle(request.query.code_challenge_method)
      const state = getSingle(request.query.state)
      const requestedScopes = (getSingle(request.query.scope) || 'readr.posts.read').split(' ')
      if (!clientId || !redirectUri || responseType !== 'code' || !challenge || method !== 'S256') {
        return oauthError(response, 'invalid_request', 'client_id, redirect_uri, response_type=code, and S256 PKCE are required')
      }
      const context = await commonContext.withRequest(request, response)
      const client = await findClient(context, clientId)
      if (!client?.isActive || !stringArray(client.redirectUris).includes(redirectUri)) {
        return oauthError(response, 'invalid_request', 'Unknown client or redirect URI')
      }
      const allowedScopes = scopes(client.allowedScopes)
      if (!requestedScopes.length || requestedScopes.some((scope) => !allowedScopes.includes(scope))) {
        return response.redirect(redirectError(redirectUri, 'invalid_scope', state))
      }
      const userId = context.session?.itemId
      if (!userId || !context.session?.data?.role || !context.session.data.name) {
        return oauthError(response, 'login_required', 'Sign in to READr CMS, then retry the authorization request', 401)
      }
      const user = (await context.sudo().query.User.findOne?.({
        where: { id: userId },
        query: 'id name role',
      })) as OAuthUser | null
      if (!user || !['admin', 'moderator', 'editor'].includes(user.role)) {
        return response.redirect(redirectError(redirectUri, 'access_denied', state))
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
    } catch (error) { next(error) }
  }

  const token = async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!configured()) return oauthError(response, 'server_error', 'OAuth is not configured', 503)
      const grantType = getSingle(request.body?.grant_type)
      const code = getSingle(request.body?.code)
      const verifier = getSingle(request.body?.code_verifier)
      const clientId = getSingle(request.body?.client_id)
      const redirectUri = getSingle(request.body?.redirect_uri)
      if (grantType !== 'authorization_code' || !code || !verifier || !clientId || !redirectUri) {
        return oauthError(response, 'invalid_request', 'authorization_code grant with code, verifier, client_id and redirect_uri is required')
      }
      const context = await commonContext.withRequest(request, response)
      const record = (await context.sudo().query.OAuthAuthorizationCode.findOne?.({
        where: { codeHash: hashCode(code) },
        query: 'id redirectUri codeChallenge scope expiresAt usedAt client { id clientId redirectUris allowedScopes isActive } user { id name role }',
      })) as OAuthCode | null
      if (!record || record.usedAt || !record.client.isActive || record.client.clientId !== clientId || record.redirectUri !== redirectUri || new Date(record.expiresAt).getTime() <= Date.now() || sha256(verifier) !== record.codeChallenge) {
        return oauthError(response, 'invalid_grant', 'Authorization code is invalid, expired, or already used')
      }
      await context.sudo().query.OAuthAuthorizationCode.updateOne?.({
        where: { id: record.id },
        data: { usedAt: new Date().toISOString() },
      })
      const scope = record.scope.split(' ').filter((value) => SUPPORTED_SCOPES.has(value))
      const accessToken = signAccessToken({
        sub: record.user.id,
        name: record.user.name,
        role: record.user.role,
        scope,
        aud: record.client.clientId,
      })
      return response.json({ access_token: accessToken, token_type: 'Bearer', expires_in: envVar.oauth.accessTokenTtlSeconds, scope: scope.join(' ') })
    } catch (error) { next(error) }
  }
  return { metadata, protectedResourceMetadata, authorize, token }
}
