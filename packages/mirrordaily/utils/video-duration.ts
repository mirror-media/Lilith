import envVar from '../environment-variables'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { getFileURL } from './common'

export async function getVideoFileDuration(filename: string): Promise<number | null> {
  try {
    if (!filename) {
      console.log('No filename provided')
      return null
    }

    const localPath = path.join(process.cwd(), envVar.videos.storagePath, filename)
    console.log(`[getVideoFileDuration] Checking local path: ${localPath}`)
    
    if (fs.existsSync(localPath)) {
      console.log(`[getVideoFileDuration] File found locally`)
      return await getVideoDurationFromPath(localPath)
    }

    const tempPath = await downloadFromGCS(filename)
    
    if (!tempPath) {
      console.log(`[getVideoFileDuration] Failed to download file from GCS for filename: ${filename}`)
      return null
    }

    try {
      const duration = await getVideoDurationFromPath(tempPath)
      fs.unlinkSync(tempPath)
      return duration
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
      throw error
    }
  } catch (error) {
    console.error('Error in getVideoFileDuration:', error)
    return null
  }
}

async function getVideoDurationFromPath(filePath: string): Promise<number | null> {
  const ffmpeg = require('fluent-ffmpeg')
  
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
      if (err) {
        resolve(null)
      } else {
        const duration = Math.floor(metadata?.format?.duration || 0)
        resolve(duration)
      }
    })
  })
}

async function downloadFromGCS(filename: string): Promise<string | null> {
  const maxRetries = 8
  const baseDelay = 1000
  const maxTotalTime = 3 * 60 * 1000
  const startTime = Date.now()
  
  const videoUrl = getFileURL(envVar.gcs.bucket, envVar.videos.baseUrl, filename)
  console.log(`[downloadFromGCS] Downloading from URL: ${videoUrl}`)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const fetch = require('node-fetch')
      const response = await fetch(videoUrl)
      
      if (!response.ok) {
        const elapsedTime = Date.now() - startTime
        
        if (attempt === maxRetries || elapsedTime >= maxTotalTime) {
          console.log(`Failed to download after ${attempt + 1} attempts. Status: ${response.status}`)
          return null
        }
        
        const delay = baseDelay * Math.pow(2, attempt)
        const remainingTime = maxTotalTime - elapsedTime
        const actualDelay = Math.min(delay, remainingTime)
        console.log(`Download failed (${response.status}), retry ${attempt + 1} in ${actualDelay}ms`)
        await new Promise(resolve => setTimeout(resolve, actualDelay))
        continue
      }
      
      const tempDir = os.tmpdir()
      const tempPath = path.join(tempDir, `video_${Date.now()}_${filename}`)
      
      const buffer = await response.buffer()
      fs.writeFileSync(tempPath, buffer)
      
      console.log(`Successfully downloaded video to ${tempPath}`)
      return tempPath
    } catch (error) {
      const elapsedTime = Date.now() - startTime
      
      if (attempt === maxRetries || elapsedTime >= maxTotalTime) {
        console.log(`Failed to download after ${attempt + 1} attempts or timeout:`, error)
        return null
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      const remainingTime = maxTotalTime - elapsedTime
      const actualDelay = Math.min(delay, remainingTime)
      console.log(`Download error (attempt ${attempt + 1}), retrying in ${actualDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, actualDelay))
    }
  }
  
  return null
}

export async function getYouTubeDuration(youtubeUrl: string): Promise<number | null> {
  try {
    if (!youtubeUrl) return null

    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (!videoIdMatch) return null

    const videoId = videoIdMatch[1]
    const apiKey = envVar.youtube?.apiKey
    
    if (!apiKey) {
      console.warn('YouTube API key not configured')
      return null
    }

    const fetch = require('node-fetch')
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
    )
    
    if (!response.ok) {
      console.error('YouTube API error:', response.statusText)
      return null
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      console.warn('YouTube video not found')
      return null
    }

    const duration = data.items[0].contentDetails.duration
    const durationInSeconds = parseYouTubeDuration(duration)
    
    return durationInSeconds
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