import envVar from '../environment-variables'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import { Storage } from '@google-cloud/storage'

export async function getVideoFileDuration(filename: string): Promise<number | null> {
  try {
    if (!filename) {
      console.log('No filename provided')
      return null
    }

    const localPath = path.join(process.cwd(), envVar.videos.storagePath, filename)
    
    if (fs.existsSync(localPath)) {
      return await getVideoDurationFromPath(localPath)
    }

    const tempPath = await downloadFromGCS(filename)
    
    if (!tempPath) {
      console.log('Failed to download file from GCS')
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
  try {
    const storage = new Storage()
    const bucket = storage.bucket(envVar.gcs.bucket)
    const gcsPath = `${envVar.videos.storagePath}/${filename}`
    const file = bucket.file(gcsPath)

    const [exists] = await file.exists()
    if (!exists) {
      return null
    }
    
    const tempDir = os.tmpdir()
    const tempPath = path.join(tempDir, `video_${Date.now()}_${filename}`)

    await file.download({ destination: tempPath })
    
    return tempPath
  } catch (error) {
    console.error('Error downloading from GCS:', error)
    return null
  }
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