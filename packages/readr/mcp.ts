import {
  McpTool,
  McpToolError,
  RequestContextFactory,
  textContent,
} from '@mirrormedia/lilith-mcp'
import envVar from './environment-variables'
import { convertToDraftJs } from './draftjs'
import { AccessTokenClaims, CommonContext, verifyAccessToken } from './oauth'

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

type StructuralRequest = {
  headers: Record<string, string | string[] | undefined>
}

const POST_SUMMARY_QUERY = `id name slug state publishTime subtitle
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

// Scopes granted by the OAuth token that produced a context. Cookie-session
// (Admin UI) callers have no entry here: they keep their full CMS permissions,
// because scopes exist to narrow third-party OAuth clients, not the user.
const contextScopes = new WeakMap<object, string[]>()
// Contexts whose request carried an invalid/expired Bearer token. An explicit
// token that fails verification must 401 even when a session cookie is also
// present, so the client re-runs its OAuth flow instead of silently
// downgrading to cookie auth.
const rejectedContexts = new WeakSet<object>()

function requireScope(context: ReadrMcpContext, scope: string) {
  const scopes = contextScopes.get(context as unknown as object)
  if (scopes && !scopes.includes(scope)) {
    throw new McpToolError(
      'The OAuth token does not include the required scope.'
    )
  }
}

function getLimit(value: unknown, defaultLimit = 20) {
  const requestedLimit = typeof value === 'number' ? value : defaultLimit
  return Math.max(1, Math.min(100, Math.floor(requestedLimit)))
}

function getString(value: unknown, name: string, required = false) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (required) throw new Error(`${name} is required`)
  return undefined
}

function result(posts: unknown) {
  return textContent(JSON.stringify(posts, null, 2))
}

function singleResult(posts: unknown) {
  return result(Array.isArray(posts) ? posts[0] || null : posts)
}

const WRITABLE_POST_FIELDS = new Set([
  'slug',
  'sortOrder',
  'name',
  'subtitle',
  'publishTime',
  'categories',
  'writers',
  'photographers',
  'cameraOperators',
  'designers',
  'engineers',
  'dataAnalysts',
  'otherByline',
  'leadingEmbeddedCode',
  'heroVideo',
  'heroImage',
  'heroCaption',
  'heroImageSize',
  'style',
  'summary',
  'content',
  'actionList',
  'citation',
  'readringTime',
  'projects',
  'tags',
  'wordCount',
  'readingTime',
  'collabration',
  'relatedPosts',
  'data',
  'ogTitle',
  'ogDescription',
  'ogImage',
  'isFeatured',
  'note',
  'project',
  'css',
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
      requireScope(context, 'readr.posts.read')
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
    description:
      'Get the complete READr article by its Keystone post ID or slug.',
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
      requireScope(context, 'readr.posts.read')
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
      requireScope(context, 'readr.posts.read')
      if (
        !Array.isArray(args.ids) ||
        !args.ids.every((id) => typeof id === 'string')
      ) {
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
      requireScope(context, 'readr.posts.read')
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
    description:
      'Filter READr posts by category (section), writer, state, or style.',
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
      requireScope(context, 'readr.posts.read')
      const conditions: Record<string, unknown>[] = []
      const categoryId = getString(args.categoryId, 'categoryId')
      const categorySlug = getString(args.categorySlug, 'categorySlug')
      const writerId = getString(args.writerId, 'writerId')
      const writerName = getString(args.writerName, 'writerName')
      const state = getString(args.state, 'state')
      const style = getString(args.style, 'style')

      if (categoryId) {
        conditions.push({
          categories: { some: { id: { equals: categoryId } } },
        })
      }
      if (categorySlug) {
        conditions.push({
          categories: { some: { slug: { equals: categorySlug } } },
        })
      }
      if (writerId)
        conditions.push({ writers: { some: { id: { equals: writerId } } } })
      if (writerName) {
        conditions.push({
          writers: {
            some: { name: { contains: writerName, mode: 'insensitive' } },
          },
        })
      }
      if (state) conditions.push({ state: { equals: state } })
      if (style) conditions.push({ style: { equals: style } })
      if (conditions.length === 0)
        throw new Error('Provide at least one filter')

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
    name: 'convert_to_draftjs',
    description:
      'Convert Google Docs HTML, Markdown, or plain text into Draft.js Raw Content State for Post content fields. Review the returned JSON, then pass it as data.content, data.summary, data.actionList, or data.citation to create_post or update_post.',
    inputSchema: {
      type: 'object',
      properties: {
        source: {
          type: 'string',
          description:
            'HTML exported or copied from Google Docs, Markdown, or plain text.',
        },
        format: {
          type: 'string',
          enum: ['html', 'markdown', 'plain_text'],
          default: 'html',
        },
      },
      required: ['source'],
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'readr.posts.read')
      const source = getString(args.source, 'source', true)
      const format = args.format === undefined ? 'html' : args.format
      if (!['html', 'markdown', 'plain_text'].includes(format as string)) {
        throw new Error('format must be html, markdown, or plain_text')
      }
      return result(
        convertToDraftJs(source, format as 'html' | 'markdown' | 'plain_text')
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
      requireScope(context, 'readr.posts.write')
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
      requireScope(context, 'readr.posts.write')
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
      requireScope(context, 'readr.posts.publish')
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

function bearerToken(request: StructuralRequest) {
  const header = request.headers['authorization']
  const value = Array.isArray(header) ? header[0] : header
  if (!value?.startsWith('Bearer ')) return undefined
  return value.slice('Bearer '.length)
}

async function bearerContext(
  base: ReadrMcpContext,
  claims: AccessTokenClaims
): Promise<ReadrMcpContext | null> {
  const client = (await base.sudo().query.OAuthClient.findOne({
    where: { clientId: claims.aud },
    query: 'id isActive',
  })) as { isActive?: boolean } | null
  if (!client?.isActive) return null
  const user = (await base.sudo().query.User.findOne({
    where: { id: claims.sub },
    query: 'id name role',
  })) as { id?: string; name?: string; role?: string } | null
  if (
    !user?.id ||
    !user.name ||
    !['admin', 'moderator', 'editor', 'contributor'].includes(user.role || '')
  ) {
    return null
  }
  const authorized = base.withSession({
    itemId: user.id,
    listKey: 'User',
    data: { id: user.id, name: user.name, role: user.role as string },
  })
  contextScopes.set(authorized as unknown as object, claims.scope)
  return authorized
}

/**
 * Bearer-first request context: a valid OAuth access token acts as the
 * token's user (with its scopes); no token falls back to the package's
 * regular session cookie; an invalid token is remembered so authorization
 * fails even when a session cookie is also present.
 */
export function createReadrMcpContext(
  commonContext: CommonContext
): RequestContextFactory<ReadrMcpContext> {
  return {
    async withRequest(request, response) {
      const base = (await commonContext.withRequest(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        request as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response as any
      )) as unknown as ReadrMcpContext
      const token = bearerToken(request as StructuralRequest)
      if (!token) return base
      const claims = verifyAccessToken(token)
      const authorized = claims ? await bearerContext(base, claims) : null
      if (authorized) return authorized
      rejectedContexts.add(base as unknown as object)
      return base
    },
  }
}

export function isReadrMcpAuthorized(context: ReadrMcpContext) {
  if (rejectedContexts.has(context as unknown as object)) return false
  return Boolean(context.session?.data?.role)
}

export function readrMcpUnauthorizedHeaders(request: StructuralRequest) {
  if (!envVar.oauth.issuer || !envVar.oauth.signingSecret) return {}
  const hostHeader = request.headers['host']
  const protoHeader = request.headers['x-forwarded-proto']
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader
  const base =
    envVar.oauth.resourceUrl ||
    `${proto || 'http'}://${host || 'localhost'}/mcp`
  const metadataUrl = new URL(
    '/.well-known/oauth-protected-resource/mcp',
    base
  ).toString()
  return { 'WWW-Authenticate': `Bearer resource_metadata="${metadataUrl}"` }
}
