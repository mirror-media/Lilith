import {
  McpTool,
  McpToolError,
  RequestContextFactory,
  textContent,
} from '@mirrormedia/lilith-mcp'
import { randomBytes } from 'crypto'
import { Readable } from 'stream'
// @ts-ignore graphql-upload does not publish TypeScript declarations for this internal export.
import Upload from 'graphql-upload/Upload.js'
import envVar from './environment-variables'
import { convertToDraftJs, createAtomicDraftJsEntity } from './draftjs'
import { AccessTokenClaims, CommonContext, verifyAccessToken } from './oauth'

type ReadrMcpContext = {
  session?: { data?: { role?: string } }
  query: {
    Post: {
      findMany: (args: Record<string, unknown>) => Promise<unknown>
      createOne: (args: Record<string, unknown>) => Promise<unknown>
      updateOne: (args: Record<string, unknown>) => Promise<unknown>
    }
    Photo: {
      createOne: (args: Record<string, unknown>) => Promise<unknown>
      findOne: (args: Record<string, unknown>) => Promise<unknown>
    }
    Video: {
      findOne: (args: Record<string, unknown>) => Promise<unknown>
    }
    AudioFile: {
      findOne: (args: Record<string, unknown>) => Promise<unknown>
    }
    Tag: {
      findMany: (args: Record<string, unknown>) => Promise<unknown>
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
const RELATED_POST_QUERY = `
  id name slug subtitle state publishTime
  categories { id slug title }
  tags { id name }
`
const POST_DETAIL_QUERY = `
  id slug sortOrder name subtitle state publishTime
  categories { id slug title } writers { id name name_en title }
  photographers { id name } cameraOperators { id name } designers { id name }
  engineers { id name } dataAnalysts { id name } otherByline
  heroCaption heroImageSize style summary content actionList citation
  readringTime wordCount readingTime tags { id name }
  relatedPosts { id name slug subtitle state publishTime }
  ogTitle ogDescription isFeatured css summaryApiData apiData actionlistApiData
  citationApiData
  createdAt updatedAt
`
const PHOTO_DETAIL_QUERY = `
  id name
  imageFile { id url filesize width height extension }
  resized { original w480 w800 w1200 w1600 w2400 }
  resizedWebp { original w480 w800 w1200 w1600 w2400 }
`
const VIDEO_DETAIL_QUERY = `
  id name url youtubeUrl description
  file { filename filesize url }
  coverPhoto { ${PHOTO_DETAIL_QUERY} }
`
const AUDIO_DETAIL_QUERY = `
  id name url description
  file { filename filesize url }
`
const TAG_SUMMARY_QUERY = `id name brief state`
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])

type SupportedImage = {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
  extension: 'jpg' | 'png' | 'webp' | 'gif'
}

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

type RawDraftBlock = {
  key: string
  text: string
  type: string
  depth: number
  inlineStyleRanges: unknown[]
  entityRanges: Array<{ offset: number; length: number; key: number }>
  data: Record<string, unknown>
}

type RawDraftEntity = {
  type: string
  mutability: 'MUTABLE' | 'IMMUTABLE'
  data: Record<string, unknown>
}

type RawDraftContent = {
  blocks: RawDraftBlock[]
  entityMap: Record<string, RawDraftEntity>
}

const RICH_TEXT_FIELDS = new Set([
  'content',
  'summary',
  'actionList',
  'citation',
])

function contentState(value: unknown): RawDraftContent {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { blocks: [], entityMap: {} }
  }
  const draft = value as Partial<RawDraftContent>
  if (
    !Array.isArray(draft.blocks) ||
    typeof draft.entityMap !== 'object' ||
    !draft.entityMap
  ) {
    return { blocks: [], entityMap: {} }
  }
  return {
    blocks: draft.blocks.map((block) => ({
      key: String(block.key),
      text: typeof block.text === 'string' ? block.text : '',
      type: typeof block.type === 'string' ? block.type : 'unstyled',
      depth: typeof block.depth === 'number' ? block.depth : 0,
      inlineStyleRanges: Array.isArray(block.inlineStyleRanges)
        ? block.inlineStyleRanges
        : [],
      entityRanges: Array.isArray(block.entityRanges) ? block.entityRanges : [],
      data:
        typeof block.data === 'object' &&
        block.data !== null &&
        !Array.isArray(block.data)
          ? block.data
          : {},
    })),
    entityMap: draft.entityMap as Record<string, RawDraftEntity>,
  }
}

function uniqueBlockKey(content: RawDraftContent) {
  const keys = new Set(content.blocks.map((block) => block.key))
  let key = ''
  do key = randomBytes(5).toString('base64url')
  while (keys.has(key))
  return key
}

function nextEntityKey(content: RawDraftContent) {
  const keys = Object.keys(content.entityMap)
    .map((key) => Number(key))
    .filter((key) => Number.isInteger(key) && key >= 0)
  return keys.length ? Math.max(...keys) + 1 : 0
}

function blockIndex(content: RawDraftContent, key: unknown) {
  const blockKey = getString(key, 'blockKey', true)
  const index = content.blocks.findIndex((block) => block.key === blockKey)
  if (index < 0) throw new McpToolError(`No block exists with key ${blockKey}.`)
  return index
}

function atomicBlock(
  content: RawDraftContent,
  entity: RawDraftEntity
): RawDraftBlock {
  const key = nextEntityKey(content)
  content.entityMap[String(key)] = entity
  return {
    key: uniqueBlockKey(content),
    text: ' ',
    type: 'atomic',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [{ offset: 0, length: 1, key }],
    data: {},
  }
}

function insertBlock(
  content: RawDraftContent,
  afterBlockKey: unknown,
  block: RawDraftBlock
) {
  if (afterBlockKey === undefined || afterBlockKey === null) {
    content.blocks.push(block)
    return
  }
  const index = blockIndex(content, afterBlockKey)
  content.blocks.splice(index + 1, 0, block)
}

function requiredItem(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new McpToolError(`${label} was not found or is not accessible.`)
  }
  return value as Record<string, unknown>
}

function imageEntity(
  photo: Record<string, unknown>,
  args: Record<string, unknown>
): RawDraftEntity {
  return {
    type: 'image',
    mutability: 'IMMUTABLE',
    data: {
      ...photo,
      desc: getString(args.caption, 'caption') || '',
      url: getString(args.url, 'url') || '',
      alignment:
        args.alignment === 'left' || args.alignment === 'right'
          ? args.alignment
          : 'center',
    },
  }
}

function removeEntityIfUnused(content: RawDraftContent, entityKey: number) {
  const stillUsed = content.blocks.some((block) =>
    block.entityRanges.some((range) => range.key === entityKey)
  )
  if (!stillUsed) delete content.entityMap[String(entityKey)]
}

function stringIds(value: unknown, name: string, max = 100) {
  if (!Array.isArray(value) || value.length > max) {
    throw new Error(`${name} must be an array with at most ${max} IDs`)
  }
  const ids = value.map((id) => getString(id, name, true))
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${name} must not contain duplicate IDs`)
  }
  return ids
}

function relationIds(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      return []
    }
    return typeof (item as Record<string, unknown>).id === 'string'
      ? [(item as Record<string, unknown>).id as string]
      : []
  })
}

async function verifyTagIds(context: ReadrMcpContext, ids: string[]) {
  if (ids.length === 0) return
  const tags = await context.query.Tag.findMany({
    take: ids.length,
    where: { id: { in: ids } },
    query: TAG_SUMMARY_QUERY,
  })
  const found = new Set(relationIds(tags))
  const missing = ids.filter((id) => !found.has(id))
  if (missing.length) {
    throw new McpToolError(`Tag IDs are unavailable: ${missing.join(', ')}`)
  }
}

async function verifyPostIds(
  context: ReadrMcpContext,
  ids: string[],
  excludedPostId: string
) {
  if (ids.includes(excludedPostId)) {
    throw new McpToolError('A post cannot be related to itself.')
  }
  if (ids.length === 0) return
  const posts = await context.query.Post.findMany({
    take: ids.length,
    where: { id: { in: ids }, state: { equals: 'published' } },
    query: RELATED_POST_QUERY,
  })
  const found = new Set(relationIds(posts))
  const missing = ids.filter((id) => !found.has(id))
  if (missing.length) {
    throw new McpToolError(
      `Related posts must exist, be published, and be accessible: ${missing.join(
        ', '
      )}`
    )
  }
}

function namedRelations(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      return []
    }
    const relation = item as Record<string, unknown>
    return typeof relation.id === 'string'
      ? [
          {
            id: relation.id,
            name:
              typeof relation.name === 'string' ? relation.name : relation.id,
          },
        ]
      : []
  })
}

function relatedCandidate(
  post: Record<string, unknown>,
  categoryIds: Set<string>,
  tagIds: Set<string>,
  sourcePublishTime: unknown
) {
  const matchingCategories = namedRelations(post.categories).filter(
    (category) => categoryIds.has(category.id)
  )
  const matchingTags = namedRelations(post.tags).filter((tag) =>
    tagIds.has(tag.id)
  )
  const reasons = [
    ...matchingCategories.map((category) => `same category: ${category.name}`),
    ...matchingTags.map((tag) => `shared tag: ${tag.name}`),
  ]
  const candidatePublishTime =
    typeof post.publishTime === 'string'
      ? Date.parse(post.publishTime)
      : Number.NaN
  const sourceTime =
    typeof sourcePublishTime === 'string'
      ? Date.parse(sourcePublishTime)
      : Number.NaN
  let publicationScore = 0
  let publishedDateDistanceDays: number | null = null
  if (!Number.isNaN(candidatePublishTime)) {
    // News coverage is most useful when it is close to the source article's
    // reporting window. Also retain a smaller global-recency signal so a
    // timely follow-up can outrank an otherwise identical old article.
    if (!Number.isNaN(sourceTime)) {
      publishedDateDistanceDays = Math.round(
        Math.abs(candidatePublishTime - sourceTime) / 86_400_000
      )
      publicationScore += 8 * Math.exp(-publishedDateDistanceDays / 30)
      reasons.push(
        `published ${publishedDateDistanceDays} day(s) from source article`
      )
    }
    const ageDays = Math.max(
      0,
      (Date.now() - candidatePublishTime) / 86_400_000
    )
    publicationScore += 4 * Math.exp(-ageDays / 180)
  }
  return {
    ...post,
    score:
      matchingCategories.length * 3 +
      matchingTags.length * 5 +
      Number(publicationScore.toFixed(2)),
    publicationScore: Number(publicationScore.toFixed(2)),
    publishedDateDistanceDays,
    reasons,
  }
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

function imageType(bytes: Buffer): SupportedImage | undefined {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { mimeType: 'image/jpeg', extension: 'jpg' }
  }
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { mimeType: 'image/png', extension: 'png' }
  }
  if (
    bytes.length >= 6 &&
    /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString())
  ) {
    return { mimeType: 'image/gif', extension: 'gif' }
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).equals(Buffer.from('RIFF')) &&
    bytes.subarray(8, 12).equals(Buffer.from('WEBP'))
  ) {
    return { mimeType: 'image/webp', extension: 'webp' }
  }
}

function imageUpload(value: unknown, mimeType: unknown) {
  const valueString = getString(value, 'image', true)
  const dataUrl = /^data:([^;,]+);base64,([\s\S]+)$/i.exec(valueString)
  const encoded = (dataUrl ? dataUrl[2] : valueString).replace(/\s+/g, '')
  if (!/^[a-z0-9+/]*={0,2}$/i.test(encoded)) {
    throw new McpToolError('image must be a base64 string or image data URL.')
  }

  const unpadded = encoded.replace(/=+$/, '')
  if (!unpadded || unpadded.length % 4 === 1) {
    throw new McpToolError(
      'image must contain valid base64-encoded image data.'
    )
  }
  const normalized = unpadded.padEnd(Math.ceil(unpadded.length / 4) * 4, '=')
  const bytes = Buffer.from(normalized, 'base64')
  if (
    bytes.length === 0 ||
    bytes.toString('base64').replace(/=+$/, '') !== unpadded
  ) {
    throw new McpToolError(
      'image must contain valid base64-encoded image data.'
    )
  }
  if (bytes.length > MAX_IMAGE_BYTES) {
    throw new McpToolError('image must not exceed 10 MiB.')
  }

  const detected = imageType(bytes)
  if (!detected) {
    throw new McpToolError(
      'Only JPEG, PNG, WebP, and GIF images are supported.'
    )
  }
  const suppliedMimeType = dataUrl?.[1] || getString(mimeType, 'mimeType')
  if (
    suppliedMimeType &&
    suppliedMimeType.toLowerCase() !== detected.mimeType
  ) {
    throw new McpToolError('mimeType does not match the uploaded image.')
  }
  return { bytes, ...detected }
}

function imageFilename(value: unknown, extension: SupportedImage['extension']) {
  const supplied = getString(value, 'filename')
  const safe = supplied?.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180)
  const stem = (safe || 'image').replace(/\.[^.]+$/, '') || 'image'
  return `${stem}.${extension}`
}

function imageUploadValue(
  bytes: Buffer,
  filename: string,
  mimeType: SupportedImage['mimeType']
) {
  // context.query reaches GraphQL's Upload scalar through `variableValues`.
  // Its parseValue accepts only a graphql-upload Upload instance, not the
  // Promise/FileUpload shape that field resolvers receive after parsing.
  const upload = new Upload()
  upload.resolve({
    createReadStream: () => Readable.from(bytes),
    filename,
    mimetype: mimeType,
    encoding: '7bit',
  })
  return upload
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
    name: 'search_tags',
    description:
      'Search the existing READr tag vocabulary. Use this after analyzing an article, so suggested concepts can be resolved to controlled tag IDs instead of creating near-duplicate tags.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional tag name fragment. Omit to list active tags.',
        },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'readr.posts.read')
      const query = getString(args.query, 'query')
      return result(
        await context.query.Tag.findMany({
          take: getLimit(args.limit),
          orderBy: { name: 'asc' },
          where: query
            ? {
                AND: [
                  { state: { equals: 'active' } },
                  { name: { contains: query, mode: 'insensitive' } },
                ],
              }
            : { state: { equals: 'active' } },
          query: TAG_SUMMARY_QUERY,
        })
      )
    },
  },
  {
    name: 'suggest_related_posts',
    description:
      'Return lightweight related-post candidates for editorial review. Candidates are published posts sharing categories or tags with the source post, scored by tag/category overlap and publication-date proximity/recency. Read shortlisted articles with get_posts before asking a person to confirm.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Source Post ID' },
        limit: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
      },
      required: ['id'],
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'readr.posts.read')
      const postId = getPostId(args.id)
      const sourceRows = await context.query.Post.findMany({
        take: 1,
        where: { id: { equals: postId } },
        query: `${RELATED_POST_QUERY} relatedPosts { id }`,
      })
      const source = Array.isArray(sourceRows)
        ? requiredItem(sourceRows[0], 'Post')
        : requiredItem(sourceRows, 'Post')
      const categoryIds = new Set(relationIds(source.categories))
      const tagIds = new Set(relationIds(source.tags))
      if (categoryIds.size === 0 && tagIds.size === 0) {
        throw new McpToolError(
          'The post has no categories or tags. Add reviewed tags before requesting related-post candidates.'
        )
      }
      const excludedIds = [postId, ...relationIds(source.relatedPosts)]
      const relations: Record<string, unknown>[] = []
      if (categoryIds.size) {
        relations.push({
          categories: { some: { id: { in: [...categoryIds] } } },
        })
      }
      if (tagIds.size) {
        relations.push({ tags: { some: { id: { in: [...tagIds] } } } })
      }
      const candidates = await context.query.Post.findMany({
        take: 50,
        orderBy: { publishTime: 'desc' },
        where: {
          AND: [
            { state: { equals: 'published' } },
            { id: { notIn: excludedIds } },
            { OR: relations },
          ],
        },
        query: RELATED_POST_QUERY,
      })
      const limit = Math.min(getLimit(args.limit, 10), 20)
      const ranked = (Array.isArray(candidates) ? candidates : [])
        .map((candidate) =>
          relatedCandidate(
            requiredItem(candidate, 'Candidate post'),
            categoryIds,
            tagIds,
            source.publishTime
          )
        )
        .sort((left, right) => right.score - left.score)
        .slice(0, limit)
      return result({ sourcePostId: postId, candidates: ranked })
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
    name: 'upload_image',
    description:
      'Upload a JPEG, PNG, WebP, or GIF to the READr CMS photo library. The result includes the Photo record and a native `draftjs` image block with editable caption, link, and alignment; append that block to a converted article content entityMap/blocks. Resize URLs are generated asynchronously and can return 404 until the CMS resize pipeline completes.',
    inputSchema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          description:
            'Base64-encoded image data, optionally as a data URL. Maximum decoded size: 10 MiB.',
        },
        filename: {
          type: 'string',
          description:
            'Optional source filename. Its extension is replaced with the detected image type.',
        },
        mimeType: {
          type: 'string',
          enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          description:
            'Required when image is raw base64; omit when image is a data URL.',
        },
        name: {
          type: 'string',
          description: 'Optional CMS photo title. Defaults to the filename.',
        },
        caption: {
          type: 'string',
          description:
            'Optional editable image caption shown below the image in the READr CMS editor.',
        },
        url: {
          type: 'string',
          description: 'Optional destination URL when readers click the image.',
        },
        alignment: {
          type: 'string',
          enum: ['left', 'center', 'right'],
          default: 'center',
          description: 'Image alignment in the article.',
        },
      },
      required: ['image'],
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'readr.posts.write')
      const upload = imageUpload(args.image, args.mimeType)
      const filename = imageFilename(args.filename, upload.extension)
      const name = getString(args.name, 'name') || filename
      const caption = getString(args.caption, 'caption') || ''
      const url = getString(args.url, 'url') || ''
      const alignment =
        args.alignment === 'left' || args.alignment === 'right'
          ? args.alignment
          : 'center'
      const photo = await context.query.Photo.createOne({
        data: {
          name,
          imageFile: {
            // Use the same Upload scalar path as GraphQL multipart uploads,
            // so Keystone's configured `images` storage is the only writer.
            upload: imageUploadValue(upload.bytes, filename, upload.mimeType),
          },
        },
        query: PHOTO_DETAIL_QUERY,
      })
      // `imageLink` is only an external URL and the CMS editor cannot edit a
      // caption for it. Return the native lower-case `image` entity instead,
      // using the same flat photo data shape as the Image toolbar button.
      const photoData = photo as Record<string, unknown>
      return result({
        ...photoData,
        draftjs: createAtomicDraftJsEntity({
          type: 'image',
          mutability: 'IMMUTABLE',
          data: {
            ...photoData,
            desc: caption,
            url,
            alignment,
          },
        }),
      })
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
    name: 'update_post_content',
    description:
      'Safely edit one READr Draft.js rich-text field using block-aware operations. Use get_post first to obtain stable block keys. Insert operations read the referenced CMS media record and create the native entity data automatically; they never create or upload media.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Keystone Post ID' },
        field: {
          type: 'string',
          enum: ['content', 'summary', 'actionList', 'citation'],
          default: 'content',
          description: 'The Draft.js field to edit.',
        },
        expectedUpdatedAt: {
          type: 'string',
          description:
            'Optional updatedAt value returned by get_post. The operation fails if the post changed before this update.',
        },
        operations: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'insert_image',
                  'insert_video',
                  'insert_audio',
                  'insert_youtube',
                  'replace_block',
                  'remove_block',
                ],
              },
              afterBlockKey: {
                type: 'string',
                description:
                  'Insert after this block key. Omit only to append at the end of the field.',
              },
              blockKey: {
                type: 'string',
                description:
                  'Existing block key for replace_block or remove_block.',
              },
              photoId: { type: 'string' },
              videoId: { type: 'string' },
              audioId: { type: 'string' },
              youtubeId: {
                type: 'string',
                description: 'An 11-character YouTube video ID or YouTube URL.',
              },
              caption: { type: 'string' },
              description: { type: 'string' },
              url: { type: 'string' },
              alignment: { type: 'string', enum: ['left', 'center', 'right'] },
              block: {
                type: 'object',
                description:
                  'Replacement text block. Supported properties: text, type, depth, data, inlineStyleRanges. Atomic blocks must use an insert operation instead.',
              },
            },
            required: ['type'],
            additionalProperties: false,
          },
        },
      },
      required: ['id', 'operations'],
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'readr.posts.write')
      const field = args.field === undefined ? 'content' : args.field
      if (typeof field !== 'string' || !RICH_TEXT_FIELDS.has(field)) {
        throw new Error(
          'field must be content, summary, actionList, or citation'
        )
      }
      if (!Array.isArray(args.operations) || args.operations.length === 0) {
        throw new Error('operations must be a non-empty array')
      }
      const postId = getPostId(args.id)
      const posts = await context.query.Post.findMany({
        take: 1,
        where: { id: { equals: postId } },
        query: `id updatedAt ${field}`,
      })
      const post = Array.isArray(posts)
        ? requiredItem(posts[0], 'Post')
        : requiredItem(posts, 'Post')
      const expectedUpdatedAt = getString(
        args.expectedUpdatedAt,
        'expectedUpdatedAt'
      )
      if (expectedUpdatedAt && post.updatedAt !== expectedUpdatedAt) {
        throw new McpToolError(
          'The post changed since it was read. Fetch it again before editing.'
        )
      }
      const content = contentState(post[field])

      for (const operation of args.operations) {
        if (
          typeof operation !== 'object' ||
          operation === null ||
          Array.isArray(operation)
        ) {
          throw new Error('Each operation must be an object')
        }
        const input = operation as Record<string, unknown>
        const type = getString(input.type, 'operation.type', true)
        if (type === 'insert_image') {
          const photo = requiredItem(
            await context.query.Photo.findOne({
              where: { id: getString(input.photoId, 'photoId', true) },
              query: PHOTO_DETAIL_QUERY,
            }),
            'Photo'
          )
          insertBlock(
            content,
            input.afterBlockKey,
            atomicBlock(content, imageEntity(photo, input))
          )
        } else if (type === 'insert_video') {
          const video = requiredItem(
            await context.query.Video.findOne({
              where: { id: getString(input.videoId, 'videoId', true) },
              query: VIDEO_DETAIL_QUERY,
            }),
            'Video'
          )
          insertBlock(
            content,
            input.afterBlockKey,
            atomicBlock(content, {
              type: 'VIDEO',
              mutability: 'IMMUTABLE',
              data: {
                video,
                desc: getString(input.description, 'description') || '',
              },
            })
          )
        } else if (type === 'insert_audio') {
          const audio = requiredItem(
            await context.query.AudioFile.findOne({
              where: { id: getString(input.audioId, 'audioId', true) },
              query: AUDIO_DETAIL_QUERY,
            }),
            'AudioFile'
          )
          insertBlock(
            content,
            input.afterBlockKey,
            atomicBlock(content, {
              type: 'AUDIO',
              mutability: 'IMMUTABLE',
              data: { audio },
            })
          )
        } else if (type === 'insert_youtube') {
          const youtubeValue = getString(input.youtubeId, 'youtubeId', true)
          const youtubeId = youtubeValue.match(/[a-zA-Z0-9_-]{11}/)?.[0]
          if (!youtubeId) {
            throw new McpToolError(
              'youtubeId must contain a valid YouTube video ID.'
            )
          }
          insertBlock(
            content,
            input.afterBlockKey,
            atomicBlock(content, {
              // READr's existing editor and public renderer support the
              // editable EMBEDDEDCODE block. Its separate YOUTUBE entity is
              // not wired into the READr entry, so use the native supported
              // embed shape without changing shared Draft packages.
              type: 'EMBEDDEDCODE',
              mutability: 'IMMUTABLE',
              data: {
                caption: getString(input.description, 'description') || '',
                embeddedCode: `<iframe src="https://www.youtube.com/embed/${youtubeId}" title="YouTube video" loading="lazy" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
              },
            })
          )
        } else if (type === 'remove_block') {
          const index = blockIndex(content, input.blockKey)
          const [removed] = content.blocks.splice(index, 1)
          for (const range of removed.entityRanges) {
            removeEntityIfUnused(content, range.key)
          }
        } else if (type === 'replace_block') {
          const index = blockIndex(content, input.blockKey)
          if (
            typeof input.block !== 'object' ||
            input.block === null ||
            Array.isArray(input.block)
          ) {
            throw new Error('replace_block requires a block object')
          }
          const replacement = input.block as Record<string, unknown>
          if (replacement.type === 'atomic') {
            throw new McpToolError('Use an insert operation for atomic blocks.')
          }
          const oldBlock = content.blocks[index]
          content.blocks[index] = {
            key: oldBlock.key,
            text:
              typeof replacement.text === 'string'
                ? replacement.text
                : oldBlock.text,
            type:
              typeof replacement.type === 'string'
                ? replacement.type
                : oldBlock.type,
            depth:
              typeof replacement.depth === 'number'
                ? replacement.depth
                : oldBlock.depth,
            inlineStyleRanges: Array.isArray(replacement.inlineStyleRanges)
              ? replacement.inlineStyleRanges
              : oldBlock.inlineStyleRanges,
            entityRanges: oldBlock.entityRanges,
            data:
              typeof replacement.data === 'object' &&
              replacement.data !== null &&
              !Array.isArray(replacement.data)
                ? (replacement.data as Record<string, unknown>)
                : oldBlock.data,
          }
        } else {
          throw new Error(`Unsupported operation type: ${type}`)
        }
      }

      return result(
        await context.query.Post.updateOne({
          where: { id: postId },
          data: { [field]: content },
          query: POST_DETAIL_QUERY,
        })
      )
    },
  },
  {
    name: 'update_post_tags',
    description:
      'Apply reviewed existing tags to a post. This tool never creates tags; use search_tags to resolve the agent’s content-based suggestions to controlled tag IDs first.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Keystone Post ID' },
        tagIds: {
          type: 'array',
          maxItems: 100,
          items: { type: 'string' },
          description:
            'Existing Tag IDs. An empty list is allowed only with mode=replace.',
        },
        mode: { type: 'string', enum: ['replace', 'add', 'remove'] },
      },
      required: ['id', 'tagIds', 'mode'],
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'readr.posts.write')
      const postId = getPostId(args.id)
      const tagIds = stringIds(args.tagIds, 'tagIds')
      const mode = getString(args.mode, 'mode', true)
      if (!['replace', 'add', 'remove'].includes(mode)) {
        throw new Error('mode must be replace, add, or remove')
      }
      if (mode !== 'replace' && tagIds.length === 0) {
        throw new Error('tagIds must not be empty unless mode is replace')
      }
      await verifyTagIds(context, tagIds)
      const rows = await context.query.Post.findMany({
        take: 1,
        where: { id: { equals: postId } },
        query: 'id tags { id }',
      })
      const post = Array.isArray(rows)
        ? requiredItem(rows[0], 'Post')
        : requiredItem(rows, 'Post')
      const currentIds = relationIds(post.tags)
      const requested = new Set(tagIds)
      const nextIds =
        mode === 'replace'
          ? tagIds
          : mode === 'add'
          ? [...new Set([...currentIds, ...tagIds])]
          : currentIds.filter((id) => !requested.has(id))
      return result(
        await context.query.Post.updateOne({
          where: { id: postId },
          data: { tags: { set: nextIds.map((id) => ({ id })) } },
          query: POST_DETAIL_QUERY,
        })
      )
    },
  },
  {
    name: 'set_related_posts',
    description:
      'Update the Post form’s relatedPosts relationship after a person confirms the agent’s shortlisted candidates. This does not insert an in-content RELATEDPOST Draft.js block.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Keystone Post ID' },
        postIds: {
          type: 'array',
          maxItems: 20,
          items: { type: 'string' },
          description:
            'Published Post IDs to relate. An empty list is allowed only with mode=replace.',
        },
        mode: { type: 'string', enum: ['replace', 'add', 'remove'] },
      },
      required: ['id', 'postIds', 'mode'],
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'readr.posts.write')
      const postId = getPostId(args.id)
      const postIds = stringIds(args.postIds, 'postIds', 20)
      const mode = getString(args.mode, 'mode', true)
      if (!['replace', 'add', 'remove'].includes(mode)) {
        throw new Error('mode must be replace, add, or remove')
      }
      if (mode !== 'replace' && postIds.length === 0) {
        throw new Error('postIds must not be empty unless mode is replace')
      }
      await verifyPostIds(context, postIds, postId)
      const rows = await context.query.Post.findMany({
        take: 1,
        where: { id: { equals: postId } },
        query: 'id relatedPosts { id }',
      })
      const post = Array.isArray(rows)
        ? requiredItem(rows[0], 'Post')
        : requiredItem(rows, 'Post')
      const currentIds = relationIds(post.relatedPosts)
      const requested = new Set(postIds)
      const nextIds =
        mode === 'replace'
          ? postIds
          : mode === 'add'
          ? [...new Set([...currentIds, ...postIds])]
          : currentIds.filter((id) => !requested.has(id))
      return result(
        await context.query.Post.updateOne({
          where: { id: postId },
          data: { relatedPosts: { set: nextIds.map((id) => ({ id })) } },
          query: POST_DETAIL_QUERY,
        })
      )
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
