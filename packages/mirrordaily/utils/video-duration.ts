import envVar from '../environment-variables'

export async function getVideoFileDuration(videoFile: string): Promise<number | null> {
  return 0;
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