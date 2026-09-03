import { McpToolError } from './express'
import { RequestContextFactory } from './types'
import {
  AccessTokenClaims,
  OAuthCommonContext,
  OAuthConfig,
  createAccessTokenVerifier,
  isOAuthConfigured,
} from './oauth'

/**
 * Structural context required by the bearer-auth layer: the package's
 * Keystone context with session data plus the lists it consults.
 */
export type BearerAuthContext = {
  session?: { data?: { role?: string } }
  query: Record<
    string,
    {
      findOne?: (args: Record<string, unknown>) => Promise<unknown>
    }
  >
  sudo: () => BearerAuthContext
  withSession: (session: {
    itemId: string
    listKey: 'User'
    data: { id: string; name: string; role: string }
  }) => BearerAuthContext
}

type StructuralRequest = {
  headers: Record<string, string | string[] | undefined>
}

function bearerToken(request: StructuralRequest) {
  const header = request.headers['authorization']
  const value = Array.isArray(header) ? header[0] : header
  if (!value?.startsWith('Bearer ')) return undefined
  return value.slice('Bearer '.length)
}

/**
 * Creates the package's MCP auth wiring from its OAuth config:
 *
 * - `contextFactory(commonContext)`: bearer-first request context — a valid
 *   OAuth access token acts as the token's user (with its scopes); no token
 *   falls back to the package's regular session cookie; an invalid token is
 *   remembered so authorization fails even when a cookie is also present.
 * - `isAuthorized` / `unauthorizedHeaders` / `requireScope`: plug into
 *   `createMcpExpressHandler` and tool implementations.
 *
 * All pieces share one closure, so the scope bookkeeping stays consistent.
 */
export function createMcpAuth(config: OAuthConfig) {
  const verifyAccessToken = createAccessTokenVerifier(config)

  // Scopes granted by the OAuth token that produced a context. Cookie-session
  // (Admin UI) callers have no entry here: they keep their full CMS
  // permissions, because scopes narrow third-party OAuth clients, not the user.
  const contextScopes = new WeakMap<object, string[]>()
  // Contexts whose request carried an invalid/expired Bearer token. An
  // explicit token that fails verification must 401 even when a session
  // cookie is also present, so the client re-runs its OAuth flow instead of
  // silently downgrading to cookie auth.
  const rejectedContexts = new WeakSet<object>()

  function requireScope(context: unknown, scope: string) {
    const scopes = contextScopes.get(context as object)
    if (scopes && !scopes.includes(scope)) {
      throw new McpToolError(
        'The OAuth token does not include the required scope.'
      )
    }
  }

  async function bearerContext(
    base: BearerAuthContext,
    claims: AccessTokenClaims
  ): Promise<BearerAuthContext | null> {
    const client = (await base.sudo().query.OAuthClient.findOne?.({
      where: { clientId: claims.aud },
      query: 'id isActive',
    })) as { isActive?: boolean } | null
    if (!client?.isActive) return null
    const user = (await base.sudo().query.User.findOne?.({
      where: { id: claims.sub },
      query: 'id name role',
    })) as { id?: string; name?: string; role?: string } | null
    if (
      !user?.id ||
      !user.name ||
      !config.tokenRoles.includes(user.role || '')
    ) {
      return null
    }
    const authorized = base.withSession({
      itemId: user.id,
      listKey: 'User',
      data: { id: user.id, name: user.name, role: user.role as string },
    })
    contextScopes.set(authorized as object, claims.scope)
    return authorized
  }

  function contextFactory<Context extends BearerAuthContext>(
    commonContext: OAuthCommonContext
  ): RequestContextFactory<Context> {
    return {
      async withRequest(request, response) {
        const base = (await commonContext.withRequest(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          request as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          response as any
        )) as unknown as Context
        const token = bearerToken(request as StructuralRequest)
        if (!token) return base
        const claims = verifyAccessToken(token)
        const authorized = claims ? await bearerContext(base, claims) : null
        if (authorized) return authorized as Context
        rejectedContexts.add(base as object)
        return base
      },
    }
  }

  function isAuthorized(context: { session?: { data?: { role?: string } } }) {
    if (rejectedContexts.has(context as object)) return false
    return Boolean(context.session?.data?.role)
  }

  function unauthorizedHeaders(request: StructuralRequest) {
    if (!isOAuthConfigured(config)) return {}
    const hostHeader = request.headers['host']
    const protoHeader = request.headers['x-forwarded-proto']
    const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader
    const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader
    const base =
      config.resourceUrl || `${proto || 'http'}://${host || 'localhost'}/mcp`
    const metadataUrl = new URL(
      '/.well-known/oauth-protected-resource/mcp',
      base
    ).toString()
    return { 'WWW-Authenticate': `Bearer resource_metadata="${metadataUrl}"` }
  }

  return {
    verifyAccessToken,
    requireScope,
    contextFactory,
    isAuthorized,
    unauthorizedHeaders,
  }
}
