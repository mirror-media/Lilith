import type { NextFunction, Request, Response } from 'express'
import envVar from './environment-variables'
import { CommonContext, verifyAccessToken } from './oauth'

type McpTextContent = { type: 'text'; text: string }

type McpTool<Context> = {
  name: string
  description: string
  inputSchema?: Record<string, unknown>
  execute: (
    args: Record<string, unknown>,
    context: Context
  ) => Promise<McpTextContent[]> | McpTextContent[]
}

type ReadrMcpContext = {
  session?: { data?: { role?: string } }
  query: {
    Post: {
      findMany: (args: Record<string, unknown>) => Promise<unknown>
      createOne: (args: Record<string, unknown>) => Promise<unknown>
      updateOne: (args: Record<string, unknown>) => Promise<unknown>
    }
    User: {
      findOne: (args: Record<string, unknown>) => Promise<unknown>
    }
    OAuthClient: {
      findOne: (args: Record<string, unknown>) => Promise<unknown>
    }
  }
  sudo: () => ReadrMcpContext
  withSession: (session: {
    itemId: string
    listKey: 'User'
    data: { id: string; name: string; role: string }
  }) => ReadrMcpContext
}

type JsonRpcRequest = {
  jsonrpc?: unknown
  id?: string | number | null
  method?: unknown
  params?: unknown
}

const JSON_RPC_VERSION = '2.0'
const MCP_PROTOCOL_VERSION = '2025-03-26'

const POST_SUMMARY_QUERY =
  `id name slug state publishTime subtitle
   categories { id slug title } writers { id name }`
const POST_DETAIL_QUERY = `
  id slug sortOrder name subtitle state publishTime
  categories { id slug title } writers { id name name_en title }
  photographers { id name } cameraOperators { id name } designers { id name }
  engineers { id name } dataAnalysts { id name } otherByline
  heroCaption heroImageSize style summary content actionList citation
  readringTime wordCount readingTime tags { id name }
  ogTitle ogDescription isFeatured css summaryApiData apiData actionlistApiData
  citationApiData
  createdAt updatedAt
`

function getLimit(value: unknown, defaultLimit = 20) {
  const requestedLimit = typeof value === 'number' ? value : defaultLimit
  return Math.max(1, Math.min(100, Math.floor(requestedLimit)))
}

function getString(value: unknown, name: string, required = false) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (required) throw new Error(`${name} is required`)
  return undefined
}

function textContent(text: string): McpTextContent[] {
  return [{ type: 'text', text }]
}

function result(posts: unknown) {
  return textContent(JSON.stringify(posts, null, 2))
}

function singleResult(posts: unknown) {
  return result(Array.isArray(posts) ? posts[0] || null : posts)
}

const WRITABLE_POST_FIELDS = new Set([
  'slug', 'sortOrder', 'name', 'subtitle', 'publishTime', 'categories',
  'writers', 'photographers', 'cameraOperators', 'designers', 'engineers',
  'dataAnalysts', 'otherByline', 'leadingEmbeddedCode', 'heroVideo',
  'heroImage', 'heroCaption', 'heroImageSize', 'style', 'summary', 'content',
  'actionList', 'citation', 'readringTime', 'projects', 'tags', 'wordCount',
  'readingTime', 'collabration', 'relatedPosts', 'data', 'ogTitle',
  'ogDescription', 'ogImage', 'isFeatured', 'note', 'project', 'css',
])

function getPostData(value: unknown, operation: 'create' | 'update') {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('data must be an object')
  }

  const data: Record<string, unknown> = {}
  for (const [key, fieldValue] of Object.entries(value)) {
    if (!WRITABLE_POST_FIELDS.has(key)) {
      throw new Error(`${key} cannot be set through MCP`)
    }
    data[key] = fieldValue
  }
  if (operation === 'create' && !getString(data.name, 'data.name')) {
    throw new Error('data.name is required')
  }
  if (Object.keys(data).length === 0) throw new Error('data must not be empty')
  return data
}

function getPostId(value: unknown) {
  return getString(value, 'id', true)
}

export const readrMcpTools: McpTool<ReadrMcpContext>[] = [
  {
    name: 'list_recent_posts',
    description: 'List recent READr posts that the signed-in user may view.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
      additionalProperties: false,
    },
    async execute(args, context) {
      return result(
        await context.query.Post.findMany({
          take: getLimit(args.limit),
          orderBy: { publishTime: 'desc' },
          query: POST_SUMMARY_QUERY,
        })
      )
    },
  },
  {
    name: 'get_post',
    description: 'Get the complete READr article by its Keystone post ID or slug.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        slug: { type: 'string' },
      },
      anyOf: [{ required: ['id'] }, { required: ['slug'] }],
      additionalProperties: false,
    },
    async execute(args, context) {
      const id = getString(args.id, 'id')
      const slug = getString(args.slug, 'slug')
      if ((id && slug) || (!id && !slug)) {
        throw new Error('Provide exactly one of id or slug')
      }

      return singleResult(
        await context.query.Post.findMany({
          take: 1,
          where: id ? { id: { equals: id } } : { slug: { equals: slug } },
          query: POST_DETAIL_QUERY,
        })
      )
    },
  },
  {
    name: 'get_posts',
    description:
      'Get complete details for up to 100 READr posts by their Keystone IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          minItems: 1,
          maxItems: 100,
          items: { type: 'string' },
        },
      },
      required: ['ids'],
      additionalProperties: false,
    },
    async execute(args, context) {
      if (!Array.isArray(args.ids) || !args.ids.every((id) => typeof id === 'string')) {
        throw new Error('ids must be an array of post IDs')
      }
      const ids = args.ids.slice(0, 100)
      if (ids.length === 0) throw new Error('ids must not be empty')

      return result(
        await context.query.Post.findMany({
          take: ids.length,
          where: { id: { in: ids } },
          query: POST_DETAIL_QUERY,
        })
      )
    },
  },
  {
    name: 'search_posts',
    description: 'Search READr post titles, subtitles, and slugs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
      required: ['query'],
      additionalProperties: false,
    },
    async execute(args, context) {
      const searchTerm = getString(args.query, 'query', true)
      return result(
        await context.query.Post.findMany({
          take: getLimit(args.limit),
          orderBy: { publishTime: 'desc' },
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { subtitle: { contains: searchTerm, mode: 'insensitive' } },
              { slug: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
          query: POST_SUMMARY_QUERY,
        })
      )
    },
  },
  {
    name: 'filter_posts',
    description: 'Filter READr posts by category (section), writer, state, or style.',
    inputSchema: {
      type: 'object',
      properties: {
        categoryId: { type: 'string', description: 'Keystone Category ID' },
        categorySlug: { type: 'string' },
        writerId: { type: 'string', description: 'Keystone Author ID' },
        writerName: { type: 'string' },
        state: { type: 'string' },
        style: { type: 'string' },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
      additionalProperties: false,
    },
    async execute(args, context) {
      const conditions: Record<string, unknown>[] = []
      const categoryId = getString(args.categoryId, 'categoryId')
      const categorySlug = getString(args.categorySlug, 'categorySlug')
      const writerId = getString(args.writerId, 'writerId')
      const writerName = getString(args.writerName, 'writerName')
      const state = getString(args.state, 'state')
      const style = getString(args.style, 'style')

      if (categoryId) {
        conditions.push({ categories: { some: { id: { equals: categoryId } } } })
      }
      if (categorySlug) {
        conditions.push({ categories: { some: { slug: { equals: categorySlug } } } })
      }
      if (writerId) conditions.push({ writers: { some: { id: { equals: writerId } } } })
      if (writerName) {
        conditions.push({
          writers: { some: { name: { contains: writerName, mode: 'insensitive' } } },
        })
      }
      if (state) conditions.push({ state: { equals: state } })
      if (style) conditions.push({ style: { equals: style } })
      if (conditions.length === 0) throw new Error('Provide at least one filter')

      return result(
        await context.query.Post.findMany({
          take: getLimit(args.limit),
          orderBy: { publishTime: 'desc' },
          where: { AND: conditions },
          query: POST_SUMMARY_QUERY,
        })
      )
    },
  },
  {
    name: 'create_post',
    description:
      'Create a new READr article as a draft. Use publish_post to publish it after review.',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description:
            'Post fields accepted by the CMS. name is required; relationship fields use Keystone connect syntax.',
        },
      },
      required: ['data'],
      additionalProperties: false,
    },
    async execute(args, context) {
      const data = getPostData(args.data, 'create')
      const post = await context.query.Post.createOne({
        data: { ...data, state: 'draft' },
        query: POST_DETAIL_QUERY,
      })
      return result(post)
    },
  },
  {
    name: 'update_post',
    description:
      'Update editable fields on an existing READr article. This tool cannot change publication state; use publish_post.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Keystone Post ID' },
        data: {
          type: 'object',
          description:
            'Post fields accepted by the CMS. Relationship fields use Keystone update syntax.',
        },
      },
      required: ['id', 'data'],
      additionalProperties: false,
    },
    async execute(args, context) {
      const post = await context.query.Post.updateOne({
        where: { id: getPostId(args.id) },
        data: getPostData(args.data, 'update'),
        query: POST_DETAIL_QUERY,
      })
      return result(post)
    },
  },
  {
    name: 'publish_post',
    description:
      'Publish an existing READr article now, or schedule it by providing publishTime as an RFC 3339 timestamp.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Keystone Post ID' },
        publishTime: {
          type: 'string',
          format: 'date-time',
          description: 'Optional RFC 3339 publication time; defaults to now.',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
    async execute(args, context) {
      const publishTime = getString(args.publishTime, 'publishTime')
      if (publishTime && Number.isNaN(Date.parse(publishTime))) {
        throw new Error('publishTime must be an RFC 3339 timestamp')
      }
      const effectivePublishTime = publishTime || new Date().toISOString()
      const post = await context.query.Post.updateOne({
        where: { id: getPostId(args.id) },
        data: {
          state:
            new Date(effectivePublishTime).getTime() > Date.now()
              ? 'scheduled'
              : 'published',
          publishTime: effectivePublishTime,
        },
        query: POST_DETAIL_QUERY,
      })
      return result(post)
    },
  },
]

function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sendResult(response: Response, id: JsonRpcRequest['id'], result: unknown) {
  return response.json({ jsonrpc: JSON_RPC_VERSION, id: id ?? null, result })
}

function sendError(
  response: Response,
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

function accessToken(request: Request) {
  const authorization = request.header('authorization')
  if (!authorization?.startsWith('Bearer ')) return undefined
  return authorization.slice('Bearer '.length)
}

function protectedResourceMetadataUrl(request: Request) {
  const resourceUrl =
    envVar.oauth.resourceUrl || `${request.protocol}://${request.get('host')}/mcp`
  return new URL('/.well-known/oauth-protected-resource/mcp', resourceUrl).toString()
}

async function getAuthorizedContext(
  commonContext: CommonContext,
  request: Request,
  response: Response
) {
  const claims = verifyAccessToken(accessToken(request) || '')
  if (!claims) return null
  const context = (await commonContext.withRequest(request, response)) as ReadrMcpContext
  const client = (await context.sudo().query.OAuthClient.findOne({
    where: { clientId: claims.aud },
    query: 'id isActive',
  })) as { isActive?: boolean } | null
  if (!client?.isActive) return null
  const user = (await context.sudo().query.User.findOne({
    where: { id: claims.sub },
    query: 'id name role',
  })) as { id?: string; name?: string; role?: string } | null
  if (
    !user?.id ||
    !user.name ||
    !['admin', 'moderator', 'editor', 'contributor'].includes(user.role || '')
  ) return null
  return context.withSession({
    itemId: user.id,
    listKey: 'User',
    data: {
      id: user.id,
      name: user.name,
      role: user.role!,
    },
  })
}

/** A package-local MCP adapter so lilith-core remains unchanged. */
export function createReadrMcpHandler(commonContext: CommonContext) {
  const tools = new Map(readrMcpTools.map((tool) => [tool.name, tool]))
  const requiredScope: Record<string, string> = {
    list_recent_posts: 'readr.posts.read',
    get_post: 'readr.posts.read',
    get_posts: 'readr.posts.read',
    search_posts: 'readr.posts.read',
    filter_posts: 'readr.posts.read',
    create_post: 'readr.posts.write',
    update_post: 'readr.posts.write',
    publish_post: 'readr.posts.publish',
  }

  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (!isJsonRpcRequest(request.body) || request.body.jsonrpc !== JSON_RPC_VERSION) {
        return sendError(response, null, -32600, 'Invalid JSON-RPC request')
      }

      const rpcRequest = request.body
      const context = await getAuthorizedContext(commonContext, request, response)
      if (!context) {
        response.set(
          'WWW-Authenticate',
          `Bearer resource_metadata="${protectedResourceMetadataUrl(request)}"`
        )
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
          serverInfo: { name: 'lilith-readr', version: '0.1.0' },
        })
      }
      if (rpcRequest.method === 'notifications/initialized') {
        return response.status(202).end()
      }
      if (rpcRequest.method === 'tools/list') {
        return sendResult(response, rpcRequest.id, {
          tools: readrMcpTools.map(({ name, description, inputSchema }) => ({
            name,
            description,
            inputSchema: inputSchema || { type: 'object', properties: {} },
          })),
        })
      }
      if (rpcRequest.method !== 'tools/call') {
        return sendError(
          response,
          rpcRequest.id,
          -32601,
          `Unsupported method: ${String(rpcRequest.method)}`
        )
      }

      const params = rpcRequest.params
      if (typeof params !== 'object' || params === null || Array.isArray(params)) {
        return sendError(response, rpcRequest.id, -32602, 'tools/call requires an object params value')
      }
      const { name, arguments: args = {} } = params as {
        name?: unknown
        arguments?: unknown
      }
      if (typeof name !== 'string' || !tools.has(name)) {
        return sendError(response, rpcRequest.id, -32602, 'Unknown tool')
      }
      if (typeof args !== 'object' || args === null || Array.isArray(args)) {
        return sendError(response, rpcRequest.id, -32602, 'Tool arguments must be an object')
      }

      const claims = verifyAccessToken(accessToken(request) || '')
      if (!claims || (requiredScope[name] && !claims.scope.includes(requiredScope[name]))) {
        return sendResult(response, rpcRequest.id, {
          content: textContent('The OAuth token does not include the required scope.'),
          isError: true,
        })
      }

      try {
        const content = await tools.get(name)!.execute(args as Record<string, unknown>, context)
        return sendResult(response, rpcRequest.id, { content })
      } catch {
        return sendResult(response, rpcRequest.id, {
          content: textContent('The tool could not complete the request.'),
          isError: true,
        })
      }
    } catch (error) {
      next(error)
    }
  }
}
