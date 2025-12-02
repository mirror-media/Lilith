/* eslint-disable @typescript-eslint/no-explicit-any */
import envVar from '../environment-variables'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { pipeline } from 'stream'
import { promisify } from 'util'
import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import { getFileURL } from './common'

const streamPipeline = promisify(pipeline)

export async function getVideoFileDuration(
  filename: string
): Promise<number | null> {
  let tempPath: string | null = null

  try {
    if (!filename) {
      console.log('No filename provided')
      return null
    }

    const localPath = path.resolve(
      process.cwd(),
      envVar.videos.storagePath,
      filename
    )
    console.log(`[getVideoFileDuration] Checking local path: ${localPath}`)

    if (fs.existsSync(localPath)) {
      console.log(`[getVideoFileDuration] File found locally`)
      return await getVideoDurationFromPath(localPath)
    }

    // 若本地沒有，則從 GCS 下載到暫存區
    tempPath = await downloadFromGCS(filename)

    if (!tempPath) {
      console.log(
        `[getVideoFileDuration] Failed to download file from GCS for filename: ${filename}`
      )
      return null
    }

    const duration = await getVideoDurationFromPath(tempPath)
    return duration
  } catch (error) {
    console.error('Error in getVideoFileDuration:', error)
    return null
  } finally {
    // 確保無論成功或失敗，都刪除暫存檔案
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath)
        console.log(`[getVideoFileDuration] Temp file cleaned up: ${tempPath}`)
      } catch (e) {
        console.error(`[getVideoFileDuration] Failed to delete temp file:`, e)
      }
    }
  }
}

async function getVideoDurationFromPath(
  filePath: string
): Promise<number | null> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
      if (err) {
        console.error(`[getVideoDurationFromPath] FFprobe error:`, err)
        resolve(null)
      } else {
        const duration = Math.floor(metadata?.format?.duration || 0)
        resolve(duration)
      }
    })
  })
}

async function downloadFromGCS(filename: string): Promise<string | null> {
  const maxRetries = 3
  const baseDelay = 1000
  const videoUrl = getFileURL(
    envVar.gcs.bucket,
    envVar.videos.baseUrl,
    filename
  )

  console.log(`[downloadFromGCS] Downloading from URL: ${videoUrl}`)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(videoUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const tempDir = os.tmpdir()
      const tempPath = path.join(tempDir, `video_${Date.now()}_${filename}`)

      // 使用 Stream 寫入，避免記憶體溢出 (Fix OOM issue)
      if (!response.body) throw new Error('Response body is empty')

      await streamPipeline(response.body, fs.createWriteStream(tempPath))

      console.log(`Successfully downloaded video to ${tempPath}`)
      return tempPath
    } catch (error) {
      const isLastAttempt = attempt === maxRetries
      if (isLastAttempt) {
        console.error(
          `[downloadFromGCS] Failed after ${attempt + 1} attempts:`,
          error
        )
        return null
      }

      const delay = baseDelay * Math.pow(2, attempt)
      console.log(
        `[downloadFromGCS] Attempt ${
          attempt + 1
        } failed, retrying in ${delay}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return null
}

export async function getYouTubeDuration(
  youtubeUrl: string
): Promise<number | null> {
  try {
    if (!youtubeUrl) return null

    const videoIdMatch = youtubeUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/
    )
    if (!videoIdMatch) return null

    const videoId = videoIdMatch[1]
    const apiKey = envVar.youtube?.apiKey

    if (!apiKey) {
      console.warn('YouTube API key not configured')
      return null
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
    )

    if (!response.ok) {
      console.error('YouTube API error:', response.statusText)
      return null
    }

    const data: any = await response.json()

    if (!data.items || data.items.length === 0) {
      console.warn('YouTube video not found')
      return null
    }

    const duration = data.items[0].contentDetails.duration
    return parseYouTubeDuration(duration)
  } catch (error) {
    console.error('Error in getYouTubeDuration:', error)
    return null
  }
}

function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!match) return 0

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  return hours * 3600 + minutes * 60 + seconds
}
