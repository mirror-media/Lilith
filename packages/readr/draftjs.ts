import { createHash } from 'crypto'

type InlineStyleRange = { offset: number; length: number; style: string }
type EntityRange = { offset: number; length: number; key: number }
type RawBlock = {
  key: string
  text: string
  type: string
  depth: number
  inlineStyleRanges: InlineStyleRange[]
  entityRanges: EntityRange[]
  data: Record<string, never>
}

type RawEntity = {
  type: string
  mutability: 'MUTABLE' | 'IMMUTABLE'
  data: Record<string, unknown>
}

export type RawDraftContentState = {
  blocks: RawBlock[]
  entityMap: Record<string, RawEntity>
}

type BlockInput = { text: string; type?: string; entity?: RawEntity }

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16))
    )
}

function keyFor(index: number, text: string) {
  return createHash('sha1').update(`${index}:${text}`).digest('hex').slice(0, 8)
}

function htmlInline(value: string, entityMap: Record<string, RawEntity>) {
  const textParts: string[] = []
  const styles = new Map<string, number>()
  const links: Array<{ offset: number; href: string }> = []
  const inlineStyleRanges: InlineStyleRange[] = []
  const entityRanges: EntityRange[] = []
  const offset = () => textParts.join('').length

  for (const token of value.replace(/<br\s*\/?>/gi, '\n').split(/(<[^>]+>)/g)) {
    if (!token) continue
    if (!token.startsWith('<')) {
      textParts.push(decodeHtml(token.replace(/\s+/g, ' ')))
      continue
    }
    const closing = /^<\//.test(token)
    const name = token.replace(/^<\/?\s*([^\s/>]+).*$/, '$1').toLowerCase()
    const style =
      name === 'strong' || name === 'b'
        ? 'BOLD'
        : name === 'em' || name === 'i'
        ? 'ITALIC'
        : undefined
    if (style) {
      if (closing) {
        const start = styles.get(style)
        if (start !== undefined && offset() > start)
          inlineStyleRanges.push({
            offset: start,
            length: offset() - start,
            style,
          })
        styles.delete(style)
      } else styles.set(style, offset())
    }
    if (name === 'a') {
      if (closing) {
        const link = links.pop()
        if (link && offset() > link.offset) {
          const key = Object.keys(entityMap).length
          entityMap[String(key)] = {
            type: 'LINK',
            mutability: 'MUTABLE',
            data: { url: link.href },
          }
          entityRanges.push({
            offset: link.offset,
            length: offset() - link.offset,
            key,
          })
        }
      } else {
        const href = /href\s*=\s*["']([^"']+)["']/i.exec(token)?.[1]
        if (href) links.push({ offset: offset(), href: decodeHtml(href) })
      }
    }
  }
  return { text: textParts.join('').trim(), inlineStyleRanges, entityRanges }
}

function markdownBlocks(source: string): BlockInput[] {
  const blocks: BlockInput[] = []
  let paragraph: string[] = []
  const flush = () => {
    if (paragraph.length) blocks.push({ text: paragraph.join(' ') })
    paragraph = []
  }
  for (const line of source.replace(/\r\n?/g, '\n').split('\n')) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line)
    const unordered = /^[-*+]\s+(.+)$/.exec(line)
    const ordered = /^\d+[.)]\s+(.+)$/.exec(line)
    const image = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/.exec(line.trim())
    if (heading) {
      flush()
      blocks.push({
        text: heading[2],
        type: `header-${
          ['one', 'two', 'three', 'four', 'five', 'six'][heading[1].length - 1]
        }`,
      })
    } else if (unordered) {
      flush()
      blocks.push({ text: unordered[1], type: 'unordered-list-item' })
    } else if (ordered) {
      flush()
      blocks.push({ text: ordered[1], type: 'ordered-list-item' })
    } else if (image) {
      flush()
      blocks.push({
        text: ' ',
        type: 'atomic',
        entity: {
          type: 'imageLink',
          mutability: 'IMMUTABLE',
          data: { src: image[2], alt: image[1] },
        },
      })
    } else if (!line.trim()) flush()
    else paragraph.push(line.trim())
  }
  flush()
  return blocks
}

function htmlBlocks(source: string): BlockInput[] {
  const blocks: BlockInput[] = []
  const pattern =
    /<(h[1-6]|p|div|li|blockquote|img|video|iframe)(\s[^>]*)?(?:>([\s\S]*?)<\/\1>|\s*\/?>)/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(source))) {
    const tag = match[1].toLowerCase()
    const attrs = match[2] || ''
    const body = match[3] || ''
    const attribute = (name: string) =>
      new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i').exec(attrs)?.[1]
    if (tag === 'img') {
      const src = attribute('src')
      if (src)
        blocks.push({
          text: ' ',
          type: 'atomic',
          entity: {
            type: 'imageLink',
            mutability: 'IMMUTABLE',
            data: { src, alt: attribute('alt') || '' },
          },
        })
      continue
    }
    if (tag === 'video') {
      const src = attribute('src')
      if (src)
        blocks.push({
          text: ' ',
          type: 'atomic',
          entity: { type: 'videoLink', mutability: 'IMMUTABLE', data: { src } },
        })
      continue
    }
    if (tag === 'iframe') {
      const src = attribute('src') || ''
      const youtubeId = /(?:youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/.exec(
        src
      )?.[1]
      if (youtubeId)
        blocks.push({
          text: ' ',
          type: 'atomic',
          entity: {
            type: 'YOUTUBE',
            mutability: 'IMMUTABLE',
            data: { id: youtubeId, description: attribute('title') || '' },
          },
        })
      continue
    }
    let type = /^h[1-6]$/.test(tag)
      ? `header-${
          ['one', 'two', 'three', 'four', 'five', 'six'][Number(tag[1]) - 1]
        }`
      : tag === 'blockquote'
      ? 'blockquote'
      : 'unstyled'
    if (tag === 'li') {
      const before = source.slice(0, match.index)
      const lastOl = Math.max(
        before.lastIndexOf('<ol'),
        before.lastIndexOf('<OL')
      )
      const lastUl = Math.max(
        before.lastIndexOf('<ul'),
        before.lastIndexOf('<UL')
      )
      const lastCloseOl = Math.max(
        before.lastIndexOf('</ol'),
        before.lastIndexOf('</OL')
      )
      const lastCloseUl = Math.max(
        before.lastIndexOf('</ul'),
        before.lastIndexOf('</UL')
      )
      type =
        lastOl > lastCloseOl && lastOl > lastUl && lastOl > lastCloseUl
          ? 'ordered-list-item'
          : 'unordered-list-item'
    }
    blocks.push({ text: body, type })
  }
  return blocks.length ? blocks : [{ text: source.replace(/<[^>]*>/g, ' ') }]
}

function markdownInline(value: string) {
  return value
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
}

/** Converts basic HTML (including Google Docs export) or Markdown to Draft.js raw content. */
export function convertToDraftJs(
  source: string,
  format: 'html' | 'markdown' | 'plain_text' = 'html'
): RawDraftContentState {
  const entityMap: Record<string, RawEntity> = {}
  const inputs =
    format === 'markdown'
      ? markdownBlocks(source)
      : format === 'plain_text'
      ? source.split(/\n\s*\n/).map((text) => ({ text }))
      : htmlBlocks(source)
  const blocks = inputs
    .map((input, index) => {
      if (input.entity) {
        const entityKey = Object.keys(entityMap).length
        entityMap[String(entityKey)] = input.entity
        return {
          key: keyFor(index, input.text),
          text: ' ',
          type: 'atomic',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [{ offset: 0, length: 1, key: entityKey }],
          data: {},
        }
      }
      const inline = htmlInline(
        format === 'markdown' ? markdownInline(input.text) : input.text,
        entityMap
      )
      return {
        key: keyFor(index, inline.text),
        text: inline.text,
        type: input.type || 'unstyled',
        depth: 0,
        inlineStyleRanges: inline.inlineStyleRanges,
        entityRanges: inline.entityRanges,
        data: {},
      }
    })
    .filter((block) => block.text || block.type !== 'unstyled')
  return {
    blocks: blocks.length
      ? blocks
      : [
          {
            key: keyFor(0, ''),
            text: '',
            type: 'unstyled',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
    entityMap,
  }
}
