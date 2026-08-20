import { ExpressHandler, McpServerOptions, McpTextContent } from './types'

type JsonRpcRequest = {
  jsonrpc?: unknown
  id?: string | number | null
  method?: unknown
  params?: unknown
}

const JSON_RPC_VERSION = '2.0'
const MCP_PROTOCOL_VERSION = '2025-03-26'

/**
 * Throw from a tool's `execute` to surface `message` to the MCP client as an
 * `isError` tool result. Any other thrown error is replaced with a generic
 * message, so only deliberately chosen text ever reaches the client.
 */
export class McpToolError extends Error {}

/**
 * Decides what an MCP client may see when a tool throws. Keystone validation
 * and access-denied errors carry editor-facing messages (the Admin UI shows
 * them verbatim to the same users), so they are surfaced for every tool in
 * every package — an agent can only self-correct when it sees the reason.
 * Everything else stays behind a generic message.
 */
function toolErrorText(error: unknown): string {
  if (error instanceof McpToolError) return error.message
  const code = (error as { extensions?: { code?: string } } | null)?.extensions
    ?.code
  const message = (error as { message?: string } | null)?.message
  if (
    typeof message === 'string' &&
    (code === 'KS_VALIDATION_FAILURE' ||
      code === 'KS_ACCESS_DENIED' ||
      message.startsWith('You provided invalid data for this operation') ||
      message.startsWith('Access denied:'))
  ) {
    return message
  }
  return 'The tool could not complete the request.'
}

function sendResult(
  response: Parameters<ExpressHandler>[1],
  id: JsonRpcRequest['id'],
  result: unknown
) {
  return response.json({ jsonrpc: JSON_RPC_VERSION, id: id ?? null, result })
}

function sendError(
  response: Parameters<ExpressHandler>[1],
  id: JsonRpcRequest['id'],
  code: number,
  message: string
) {
  return response.status(code === -32601 ? 404 : 400).json({
    jsonrpc: JSON_RPC_VERSION,
    id: id ?? null,
    error: { code, message },
  })
}

function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Creates a Streamable HTTP-compatible MCP endpoint for an application's
 * existing Express server.  Authentication is deliberately delegated to the
 * Keystone context provided by the consuming package.
 */
export function createMcpExpressHandler<Context>(
  options: McpServerOptions<Context>
): ExpressHandler {
  const tools = new Map(options.tools.map((tool) => [tool.name, tool]))

  return async (request, response, next) => {
    try {
      if (
        !isJsonRpcRequest(request.body) ||
        request.body.jsonrpc !== JSON_RPC_VERSION
      ) {
        return sendError(response, null, -32600, 'Invalid JSON-RPC request')
      }

      const rpcRequest = request.body
      const context = await options.context.withRequest(request, response)
      if (!(await options.isAuthorized(context, request))) {
        if (options.unauthorizedHeaders && response.set) {
          for (const [field, value] of Object.entries(
            options.unauthorizedHeaders(request)
          )) {
            response.set(field, value)
          }
        }
        return response.status(401).json({
          jsonrpc: JSON_RPC_VERSION,
          id: rpcRequest.id ?? null,
          error: { code: -32001, message: 'Authentication required' },
        })
      }

      if (rpcRequest.method === 'initialize') {
        return sendResult(response, rpcRequest.id, {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: options.name, version: options.version },
        })
      }

      // MCP clients send this notification after initialize. Notifications do
      // not receive a JSON-RPC response.
      if (rpcRequest.method === 'notifications/initialized') {
        return response.status(202).end()
      }

      if (rpcRequest.method === 'tools/list') {
        return sendResult(response, rpcRequest.id, {
          tools: options.tools.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema: inputSchema || { type: 'object', properties: {} },
          })),
        })
      }

      if (rpcRequest.method === 'tools/call') {
        const params = rpcRequest.params
        if (
          typeof params !== 'object' ||
          params === null ||
          Array.isArray(params)
        ) {
          return sendError(
            response,
            rpcRequest.id,
            -32602,
            'tools/call requires an object params value'
          )
        }
        const { name, arguments: args = {} } = params as {
          name?: unknown
          arguments?: unknown
        }
        if (typeof name !== 'string' || !tools.has(name)) {
          return sendError(response, rpcRequest.id, -32602, 'Unknown tool')
        }
        if (typeof args !== 'object' || args === null || Array.isArray(args)) {
          return sendError(
            response,
            rpcRequest.id,
            -32602,
            'Tool arguments must be an object'
          )
        }

        try {
          const content = await tools
            .get(name)!
            .execute(args as Record<string, unknown>, context)
          return sendResult(response, rpcRequest.id, { content })
        } catch (error) {
          // Tool failures are a successful MCP protocol response. This keeps
          // the transport usable; toolErrorText decides what is safe to show.
          return sendResult(response, rpcRequest.id, {
            content: textContent(toolErrorText(error)),
            isError: true,
          })
        }
      }

      return sendError(
        response,
        rpcRequest.id,
        -32601,
        `Unsupported method: ${String(rpcRequest.method)}`
      )
    } catch (error) {
      next(error)
    }
  }
}

export function textContent(text: string): McpTextContent[] {
  return [{ type: 'text', text }]
}
