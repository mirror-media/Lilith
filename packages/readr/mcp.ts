import { McpTool, textContent } from '@mirrormedia/lilith-core'

type ReadrMcpContext = {
  session?: { data?: { role?: string } }
  query: {
    Post: {
      findMany: (args: Record<string, unknown>) => Promise<unknown>
    }
  }
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
]

/**
 * READr's MCP auth intentionally uses the same Keystone session and role used
 * by the Admin UI. List-level access is still enforced by context.query.
 */
export function isReadrMcpAuthorized(context: ReadrMcpContext) {
  return Boolean(context.session?.data?.role)
}
