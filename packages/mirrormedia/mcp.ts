import { McpTool, McpToolError, textContent } from '@mirrormedia/lilith-mcp'
import { randomBytes } from 'crypto'
import { Readable } from 'stream'
// @ts-ignore graphql-upload does not publish TypeScript declarations for this internal export.
import Upload from 'graphql-upload/Upload.js'
import { convertToDraftJs, createAtomicDraftJsEntity } from './draftjs'
import { CommonContext, mirrormediaMcpAuth } from './oauth'

type MirrormediaMcpContext = {
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
    User: {
      findOne: (args: Record<string, unknown>) => Promise<unknown>
    }
    OAuthClient: {
      findOne: (args: Record<string, unknown>) => Promise<unknown>
    }
  }
  sudo: () => MirrormediaMcpContext
  withSession: (session: {
    itemId: string
    listKey: 'User'
    data: { id: string; name: string; role: string }
  }) => MirrormediaMcpContext
}

const POST_SUMMARY_QUERY = `id title slug state publishedDate subtitle
   sections { id slug name } writers { id name }`
const POST_DETAIL_QUERY = `
  id slug title subtitle state publishedDate
  sections { id slug name } categories { id slug name }
  writers { id name } photographers { id name } camera_man { id name }
  designers { id name } engineers { id name } vocals { id name }
  extend_byline heroCaption style brief content
  topics { id slug name } tags { id name }
  og_title og_description isFeatured isAdult css
  createdAt updatedAt
`
const PHOTO_DETAIL_QUERY = `
  id name
  imageFile { id url filesize width height extension }
  resized { original w480 w800 w1200 w1600 w2400 }
  resizedWebp { original w480 w800 w1200 w1600 w2400 }
`
const VIDEO_DETAIL_QUERY = `
  id name urlOriginal videoSrc
  heroImage { ${PHOTO_DETAIL_QUERY} }
`
const AUDIO_DETAIL_QUERY = `
  id name urlOriginal audioSrc
`
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])

type SupportedImage = {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
  extension: 'jpg' | 'png' | 'webp' | 'gif'
}

// Scope enforcement and the bearer-first request context live in
// @mirrormedia/lilith-mcp; this package only supplies its OAuth config
// (./oauth).
const requireScope = mirrormediaMcpAuth.requireScope

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

const RICH_TEXT_FIELDS = new Set(['content', 'brief'])

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
    },
  }
}

function removeEntityIfUnused(content: RawDraftContent, entityKey: number) {
  const stillUsed = content.blocks.some((block) =>
    block.entityRanges.some((range) => range.key === entityKey)
  )
  if (!stillUsed) delete content.entityMap[String(entityKey)]
}

const WRITABLE_POST_FIELDS = new Set([
  'slug',
  'title',
  'subtitle',
  'publishedDate',
  'sections',
  'manualOrderOfSections',
  'categories',
  'writers',
  'photographers',
  'camera_man',
  'designers',
  'engineers',
  'vocals',
  'extend_byline',
  'heroVideo',
  'heroImage',
  'heroCaption',
  'style',
  'brief',
  'content',
  'topics',
  'relateds',
  'tags',
  'og_title',
  'og_description',
  'og_image',
  'isFeatured',
  'isAdult',
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
  if (operation === 'create' && !getString(data.title, 'data.title')) {
    throw new Error('data.title is required')
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

export const mirrormediaMcpTools: McpTool<MirrormediaMcpContext>[] = [
  {
    name: 'list_recent_posts',
    description:
      'List recent Mirror Media posts that the signed-in user may view.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'mirrormedia.posts.read')
      return result(
        await context.query.Post.findMany({
          take: getLimit(args.limit),
          orderBy: { publishedDate: 'desc' },
          query: POST_SUMMARY_QUERY,
        })
      )
    },
  },
  {
    name: 'get_post',
    description:
      'Get the complete Mirror Media article by its Keystone post ID or slug.',
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
      requireScope(context, 'mirrormedia.posts.read')
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
      'Get complete details for up to 100 Mirror Media posts by their Keystone IDs.',
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
      requireScope(context, 'mirrormedia.posts.read')
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
    description: 'Search Mirror Media post titles, subtitles, and slugs.',
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
      requireScope(context, 'mirrormedia.posts.read')
      const searchTerm = getString(args.query, 'query', true)
      return result(
        await context.query.Post.findMany({
          take: getLimit(args.limit),
          orderBy: { publishedDate: 'desc' },
          where: {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
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
      'Filter Mirror Media posts by category (section), writer, state, or style.',
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
      requireScope(context, 'mirrormedia.posts.read')
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
          orderBy: { publishedDate: 'desc' },
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
      requireScope(context, 'mirrormedia.posts.read')
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
      'Upload a JPEG, PNG, WebP, or GIF to the Mirror Media CMS photo library. The result includes the Photo record and a native `draftjs` image block with editable caption, link, and alignment; append that block to a converted article content entityMap/blocks. Resize URLs are generated asynchronously and can return 404 until the CMS resize pipeline completes.',
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
            'Optional editable image caption shown below the image in the Mirror Media CMS editor.',
        },
        url: {
          type: 'string',
          description: 'Optional destination URL when readers click the image.',
        },
      },
      required: ['image'],
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'mirrormedia.posts.write')
      const upload = imageUpload(args.image, args.mimeType)
      const filename = imageFilename(args.filename, upload.extension)
      const name = getString(args.name, 'name') || filename
      const caption = getString(args.caption, 'caption') || ''
      const url = getString(args.url, 'url') || ''
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
          },
        }),
      })
    },
  },
  {
    name: 'create_post',
    description:
      'Create a new Mirror Media article as a draft. Use publish_post to publish it after review.',
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
      requireScope(context, 'mirrormedia.posts.write')
      const data = getPostData(args.data, 'create')
      // Mirror Media requires a unique slug. Generate a placeholder when the
      // caller omits one so drafts can be created, then edited in the CMS.
      const slug =
        getString(data.slug, 'slug') || `mcp-${randomBytes(6).toString('hex')}`
      const post = await context.query.Post.createOne({
        data: { ...data, slug, state: 'draft' },
        query: POST_DETAIL_QUERY,
      })
      return result(post)
    },
  },
  {
    name: 'update_post',
    description:
      'Update editable fields on an existing Mirror Media article. This tool cannot change publication state; use publish_post.',
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
      requireScope(context, 'mirrormedia.posts.write')
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
      'Safely edit one Mirror Media Draft.js rich-text field using block-aware operations. Use get_post first to obtain stable block keys. Insert operations read the referenced CMS media record and create the native entity data automatically; they never create or upload media.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Keystone Post ID' },
        field: {
          type: 'string',
          enum: ['content', 'brief'],
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
      requireScope(context, 'mirrormedia.posts.write')
      const field = args.field === undefined ? 'content' : args.field
      if (typeof field !== 'string' || !RICH_TEXT_FIELDS.has(field)) {
        throw new Error('field must be content or brief')
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
              // Mirror Media's editor and public renderer both support the
              // native YOUTUBE entity, so no embed-code fallback is needed.
              type: 'YOUTUBE',
              mutability: 'IMMUTABLE',
              data: {
                youtubeId,
                description: getString(input.description, 'description') || '',
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
    name: 'publish_post',
    description:
      'Publish an existing Mirror Media article now, or schedule it by providing publishedDate as an RFC 3339 timestamp.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Keystone Post ID' },
        publishedDate: {
          type: 'string',
          format: 'date-time',
          description: 'Optional RFC 3339 publication time; defaults to now.',
        },
      },
      required: ['id'],
      additionalProperties: false,
    },
    async execute(args, context) {
      requireScope(context, 'mirrormedia.posts.publish')
      const publishTime = getString(args.publishedDate, 'publishedDate')
      if (publishTime && Number.isNaN(Date.parse(publishTime))) {
        throw new Error('publishedDate must be an RFC 3339 timestamp')
      }
      const effectivePublishTime = publishTime || new Date().toISOString()
      const post = await context.query.Post.updateOne({
        where: { id: getPostId(args.id) },
        data: {
          state:
            new Date(effectivePublishTime).getTime() > Date.now()
              ? 'scheduled'
              : 'published',
          publishedDate: effectivePublishTime,
        },
        query: POST_DETAIL_QUERY,
      })
      return result(post)
    },
  },
]

/**
 * Bearer-first request context, authorization gate, and 401 discovery
 * headers — all provided by @mirrormedia/lilith-mcp, configured in ./oauth.
 */
export function createMirrormediaMcpContext(commonContext: CommonContext) {
  return mirrormediaMcpAuth.contextFactory<MirrormediaMcpContext>(commonContext)
}

export const isMirrormediaMcpAuthorized = mirrormediaMcpAuth.isAuthorized

export const mirrormediaMcpUnauthorizedHeaders =
  mirrormediaMcpAuth.unauthorizedHeaders
