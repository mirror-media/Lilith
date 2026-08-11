/**
 * The small subset of the Express API used by the MCP adapter.  Keeping this
 * structural means `lilith-core` does not make every Keystone package depend
 * on Express just to define MCP tools.
 */
export type ExpressRequest = {
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}

export type ExpressResponse = {
  status: (status: number) => ExpressResponse
  json: (body: unknown) => unknown
  end: () => unknown
  /** Express `res.set`; optional so bare test doubles remain assignable. */
  set?: (field: string, value: string) => unknown
}

export type ExpressNext = (error?: unknown) => void

export type ExpressHandler = (
  request: ExpressRequest,
  response: ExpressResponse,
  next: ExpressNext
) => unknown

export type RequestContextFactory<Context> = {
  // Keystone's generated context accepts its own concrete Request/Response
  // types. Method parameters are intentionally bivariant, preserving
  // compatibility without imposing Express as a dependency of lilith-core.
  withRequest(
    request: ExpressRequest,
    response: ExpressResponse
  ): Promise<Context>
}

export type McpTextContent = {
  type: 'text'
  text: string
}

export type McpTool<Context> = {
  name: string
  description: string
  /** JSON Schema accepted by MCP clients. Defaults to an empty object. */
  inputSchema?: Record<string, unknown>
  execute: (
    args: Record<string, unknown>,
    context: Context
  ) => Promise<McpTextContent[]> | McpTextContent[]
}

export type McpAuthorization<Context> = (
  context: Context,
  request: ExpressRequest
) => boolean | Promise<boolean>

export type McpServerOptions<Context> = {
  name: string
  version: string
  context: RequestContextFactory<Context>
  tools: McpTool<Context>[]
  /**
   * Called for every request, after Keystone has restored its package-local
   * session. This lets each package keep its own authentication model.
   */
  isAuthorized: McpAuthorization<Context>
  /**
   * Extra response headers for 401 responses, e.g. the RFC 9728
   * `WWW-Authenticate: Bearer resource_metadata="..."` header that OAuth
   * clients use to discover the authorization server.
   */
  unauthorizedHeaders?: (request: ExpressRequest) => Record<string, string>
}
