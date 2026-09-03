import {
  AccessTokenClaims,
  OAuthCommonContext,
  OAuthConfig,
  createMcpAuth,
  createOAuthEndpoints,
} from '@mirrormedia/lilith-mcp'
import envVar from './environment-variables'

/**
 * Mirror Media's OAuth/MCP auth configuration. All protocol logic lives in
 * @mirrormedia/lilith-mcp; this file only supplies the package-specific
 * values and re-exports the configured instances.
 */
export const mirrormediaOAuthConfig: OAuthConfig = {
  scopes: [
    'mirrormedia.posts.read',
    'mirrormedia.posts.write',
    'mirrormedia.posts.publish',
  ],
  clientIdPrefix: 'mirrormedia_',
  tokenRoles: ['admin', 'moderator', 'editor', 'contributor'],
  authorizeRoles: ['admin', 'moderator', 'editor'],
  issuer: envVar.oauth.issuer,
  signingSecret: envVar.oauth.signingSecret,
  accessTokenTtlSeconds: envVar.oauth.accessTokenTtlSeconds,
  resourceUrl: envVar.oauth.resourceUrl,
  resourceName: 'Mirror Media CMS MCP',
  signInHint:
    'Sign in to Mirror Media CMS, then retry the authorization request',
  defaultScope: 'mirrormedia.posts.read',
}

export const mirrormediaMcpAuth = createMcpAuth(mirrormediaOAuthConfig)

export const verifyAccessToken = mirrormediaMcpAuth.verifyAccessToken

export type { AccessTokenClaims }
export type CommonContext = OAuthCommonContext

export function createOAuthHandlers(commonContext: CommonContext) {
  return createOAuthEndpoints(commonContext, mirrormediaOAuthConfig)
}
