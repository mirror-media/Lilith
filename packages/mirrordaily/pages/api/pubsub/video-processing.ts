import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getVideoFileDuration } from '../../../utils/video-duration'
import { secondsToISO8601Duration } from '../../../utils/duration-format'

const prisma = new PrismaClient()

interface PubSubMessage {
  message: {
    data: string // Base64 encoded data
    messageId: string
    publishTime: string
  }
  subscription: string
}

interface VideoProcessingMessage {
  videoId: number
  filename: string
  action: 'process_duration' | 'delete_duration'
}

async function handleVideoProcessing(message: VideoProcessingMessage): Promise<void> {
  const { videoId, filename, action } = message

  try {
    if (action === 'delete_duration') {
      await prisma.video.update({
        where: { id: videoId },
        data: { fileDuration: null }
      })
      console.log(`Cleared duration for video ${videoId}`)
      return
    }

    if (action === 'process_duration') {
      const durationInSeconds = await getVideoFileDuration(filename)
      
      if (durationInSeconds !== null) {
        const isoDuration = secondsToISO8601Duration(durationInSeconds)
        await prisma.video.update({
          where: { id: videoId },
          data: { fileDuration: isoDuration }
        })
        console.log(`Updated duration for video ${videoId}: ${isoDuration}`)
      } else {
        console.warn(`Could not get duration for video ${videoId}`)
      }
    }
  } catch (error) {
    console.error('Error processing video message:', error)
    throw error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const pubsubMessage = req.body as PubSubMessage
    
    if (!pubsubMessage.message || !pubsubMessage.message.data) {
      return res.status(400).json({ error: 'Invalid message format' })
    }

    const messageData = Buffer.from(pubsubMessage.message.data, 'base64').toString('utf-8')
    const videoMessage = JSON.parse(messageData) as VideoProcessingMessage
    
    console.log('Received video processing message:', {
      messageId: pubsubMessage.message.messageId,
      ...videoMessage
    })

    await handleVideoProcessing(videoMessage)

    res.status(200).json({ 
      success: true,
      messageId: pubsubMessage.message.messageId 
    })
  } catch (error) {
    console.error('Error handling Pub/Sub message:', error)
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}