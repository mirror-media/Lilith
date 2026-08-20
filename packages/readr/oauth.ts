import {
  AccessTokenClaims,
  OAuthCommonContext,
  OAuthConfig,
  createMcpAuth,
  createOAuthEndpoints,
} from '@mirrormedia/lilith-mcp'
import envVar from './environment-variables'

/**
 * READr's OAuth/MCP auth configuration. All protocol logic lives in
 * @mirrormedia/lilith-mcp; this file only supplies the package-specific
 * values and re-exports the configured instances.
 */
export const readrOAuthConfig: OAuthConfig = {
  scopes: ['readr.posts.read', 'readr.posts.write', 'readr.posts.publish'],
  clientIdPrefix: 'readr_',
  tokenRoles: ['admin', 'moderator', 'editor', 'contributor'],
  authorizeRoles: ['admin', 'moderator', 'editor'],
  issuer: envVar.oauth.issuer,
  signingSecret: envVar.oauth.signingSecret,
  accessTokenTtlSeconds: envVar.oauth.accessTokenTtlSeconds,
  resourceUrl: envVar.oauth.resourceUrl,
  resourceName: 'READr CMS MCP',
  signInHint: 'Sign in to READr CMS, then retry the authorization request',
  defaultScope: 'readr.posts.read',
}

export const readrMcpAuth = createMcpAuth(readrOAuthConfig)

export const verifyAccessToken = readrMcpAuth.verifyAccessToken

export type { AccessTokenClaims }
export type CommonContext = OAuthCommonContext

export function createOAuthHandlers(commonContext: CommonContext) {
  return createOAuthEndpoints(commonContext, readrOAuthConfig)
}
