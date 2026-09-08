-- The in-process MCP/OAuth authorization server was removed; MCP access now
-- goes through the external SSO gateway and plain GraphQL, so these tables
-- are unused.
ALTER TABLE "OAuthAuthorizationCode" DROP CONSTRAINT "OAuthAuthorizationCode_client_fkey";
ALTER TABLE "OAuthAuthorizationCode" DROP CONSTRAINT "OAuthAuthorizationCode_user_fkey";

DROP TABLE "OAuthAuthorizationCode";
DROP TABLE "OAuthClient";
