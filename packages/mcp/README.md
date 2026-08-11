# @mirrormedia/lilith-mcp

Reusable MCP (Model Context Protocol) Streamable HTTP transport for Lilith Keystone CMS packages.

The package implements the stateless JSON-RPC subset of MCP Streamable HTTP (`initialize`, `tools/list`, `tools/call`) as a mountable Express handler. It has zero runtime dependencies and no Keystone/Express imports (structural types only), so any Lilith package can adopt MCP without changing its `@mirrormedia/lilith-core` version line.

## Usage

```ts
import { createMcpExpressHandler } from '@mirrormedia/lilith-mcp'

// inside extendExpressApp, behind the package's IS_MCP_ENABLED flag:
app.post(
  '/mcp',
  createMcpExpressHandler({
    name: 'lilith-<package>',
    version: '0.1.0',
    context: myContextFactory, // e.g. bearer-first factory wrapping commonContext
    tools: myTools, // McpTool<Context>[]
    isAuthorized: myIsAuthorized,
    unauthorizedHeaders: myUnauthorizedHeaders, // optional, e.g. RFC 9728 WWW-Authenticate
  })
)
```

Authentication is deliberately delegated to the consuming package: the transport calls your `context` factory and `isAuthorized` per request. Tools may throw `McpToolError` to surface a deliberate error message to the client; any other thrown error is replaced with a generic one.

See `packages/readr` for a complete consumer: nine Post tools, OAuth 2.0 Authorization Code + PKCE, and a bearer-first context factory with session-cookie fallback.

## Build

```
make build   # babel -> lib/, tsc -> @types/
```
