import fetch from 'node-fetch'
import envVar from '../environment-variables'

const YT_ID_REGEX =
  /(?:youtube\.com\/watch\?(?:[^#]*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/

export function parseYoutubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const m = url.match(YT_ID_REGEX)
  return m ? m[1] : null
}

type ExtractInput = {
  contentApiData?: unknown
  sotVideoId?: string | null
  heroVideoYoutubeUrl?: string | null
}

export function extractYoutubeIds({
  contentApiData,
  sotVideoId,
  heroVideoYoutubeUrl,
}: ExtractInput): string[] {
  const ids: string[] = []
  if (typeof sotVideoId === 'string' && sotVideoId.trim() !== '') {
    ids.push(sotVideoId.trim())
  }
  const heroId = parseYoutubeId(heroVideoYoutubeUrl)
  if (heroId) ids.push(heroId)
  if (Array.isArray(contentApiData)) {
    for (const block of contentApiData as any[]) {
      if (block && block.type === 'youtube' && Array.isArray(block.content)) {
        for (const c of block.content) {
          const vid = c?.youtubeId ?? c?.id
          if (typeof vid === 'string' && vid) ids.push(vid)
        }
      }
    }
  }
  return [...new Set(ids)]
}

export function toTaipeiIso(publishedAt: string): string {
  const d = new Date(publishedAt)
  if (isNaN(d.getTime())) return ''
  const shifted = new Date(d.getTime() + 8 * 60 * 60 * 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${shifted.getUTCFullYear()}-${p(shifted.getUTCMonth() + 1)}-${p(
    shifted.getUTCDate()
  )}T${p(shifted.getUTCHours())}:${p(shifted.getUTCMinutes())}:${p(
    shifted.getUTCSeconds()
  )}+08:00`
}

function collectThumbnails(thumbnails: any): string[] {
  if (!thumbnails || typeof thumbnails !== 'object') return []
  const order = ['maxres', 'standard', 'high', 'medium', 'default']
  const urls: string[] = []
  for (const key of order) {
    const url = thumbnails[key]?.url
    if (typeof url === 'string' && url && !urls.includes(url)) urls.push(url)
  }
  return urls
}

export type VideoObject = {
  name: string
  description: string
  thumbnailUrl: string[]
  uploadDate: string
  duration: string
  contentUrl: string
  embedUrl: string
  regionsAllowed: string[]
}

export function buildVideoObject(id: string, item: any): VideoObject {
  const snippet = item?.snippet ?? {}
  const contentDetails = item?.contentDetails ?? {}
  return {
    name: snippet.title ?? '',
    description: snippet.description ?? '',
    thumbnailUrl: collectThumbnails(snippet.thumbnails),
    uploadDate: snippet.publishedAt ? toTaipeiIso(snippet.publishedAt) : '',
    duration: contentDetails.duration ?? '',
    contentUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    regionsAllowed: contentDetails.regionRestriction?.allowed ?? [],
  }
}

export type FetchStatus = 'ok' | 'invalid' | 'error'

// 'ok' = video found; 'invalid' = API responded but no item (private /
// deleted / nonexistent) -> block save; 'error' = transient failure
// (quota / 4xx-5xx / network) -> allow save, keep old data.
export function classifyResponse(
  ok: boolean,
  items: any[] | undefined
): FetchStatus {
  if (!ok) return 'error'
  if (!items || items.length === 0) return 'invalid'
  return 'ok'
}

export type FetchResult = { status: FetchStatus; item?: any }
export type Fetcher = (id: string) => Promise<FetchResult>

export async function fetchVideoResource(id: string): Promise<FetchResult> {
  const apiKey = envVar.youtube.apiKey
  if (!apiKey) {
    console.error('[videoObject] YOUTUBE_API_KEY not configured')
    return { status: 'error' }
  }
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(
        id
      )}&part=snippet,contentDetails&key=${apiKey}`
    )
    if (!res.ok) {
      console.error('[videoObject] youtube api http error:', res.status)
      return { status: 'error' }
    }
    const data: any = await res.json()
    const items = data?.items
    const status = classifyResponse(true, items)
    return status === 'ok' ? { status, item: items[0] } : { status }
  } catch (e) {
    console.error('[videoObject] youtube api fetch failed:', e)
    return { status: 'error' }
  }
}

export async function buildVideoObjects(
  ids: string[],
  fetcher: Fetcher = fetchVideoResource
): Promise<{
  objects: VideoObject[]
  hasInvalid: boolean
  hasConnectionError: boolean
}> {
  const results = await Promise.all(ids.map((id) => fetcher(id)))
  const objects: VideoObject[] = []
  let hasInvalid = false
  let hasConnectionError = false
  results.forEach((r, i) => {
    if (r.status === 'invalid') hasInvalid = true
    else if (r.status === 'error') hasConnectionError = true
    else objects.push(buildVideoObject(ids[i], r.item))
  })
  return { objects, hasInvalid, hasConnectionError }
}

export function sameStringSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sa = new Set(a)
  for (const x of b) if (!sa.has(x)) return false
  return true
}
