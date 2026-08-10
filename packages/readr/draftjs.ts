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
  type: 'LINK'
  mutability: 'MUTABLE'
  data: { url: string }
}

export type RawDraftContentState = {
  blocks: RawBlock[]
  entityMap: Record<string, RawEntity>
}

type BlockInput = { text: string; type?: string }

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
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
    const style = name === 'strong' || name === 'b' ? 'BOLD' : name === 'em' || name === 'i' ? 'ITALIC' : undefined
    if (style) {
      if (closing) {
        const start = styles.get(style)
        if (start !== undefined && offset() > start) inlineStyleRanges.push({ offset: start, length: offset() - start, style })
        styles.delete(style)
      } else styles.set(style, offset())
    }
    if (name === 'a') {
      if (closing) {
        const link = links.pop()
        if (link && offset() > link.offset) {
          const key = Object.keys(entityMap).length
          entityMap[String(key)] = { type: 'LINK', mutability: 'MUTABLE', data: { url: link.href } }
          entityRanges.push({ offset: link.offset, length: offset() - link.offset, key })
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
    const heading = /^(#{1,2})\s+(.+)$/.exec(line)
    const unordered = /^[-*+]\s+(.+)$/.exec(line)
    const ordered = /^\d+[.)]\s+(.+)$/.exec(line)
    if (heading) { flush(); blocks.push({ text: heading[2], type: heading[1] === '#' ? 'header-one' : 'header-two' }) }
    else if (unordered) { flush(); blocks.push({ text: unordered[1], type: 'unordered-list-item' }) }
    else if (ordered) { flush(); blocks.push({ text: ordered[1], type: 'ordered-list-item' }) }
    else if (!line.trim()) flush()
    else paragraph.push(line.trim())
  }
  flush()
  return blocks
}

function htmlBlocks(source: string): BlockInput[] {
  const blocks: BlockInput[] = []
  const pattern = /<(h1|h2|p|div|li|blockquote)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(source))) {
    const tag = match[1].toLowerCase()
    const type = tag === 'h1' ? 'header-one' : tag === 'h2' ? 'header-two' : tag === 'li' ? 'unordered-list-item' : tag === 'blockquote' ? 'blockquote' : 'unstyled'
    blocks.push({ text: match[2], type })
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
export function convertToDraftJs(source: string, format: 'html' | 'markdown' | 'plain_text' = 'html'): RawDraftContentState {
  const entityMap: Record<string, RawEntity> = {}
  const inputs = format === 'markdown'
    ? markdownBlocks(source)
    : format === 'plain_text'
      ? source.split(/\n\s*\n/).map((text) => ({ text }))
      : htmlBlocks(source)
  const blocks = inputs.map((input, index) => {
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
  }).filter((block) => block.text || block.type !== 'unstyled')
  return { blocks: blocks.length ? blocks : [{ key: keyFor(0, ''), text: '', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} }], entityMap }
}
