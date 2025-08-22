import { PubSub } from '@google-cloud/pubsub'
import envVar from '../environment-variables'

let pubsubClient: PubSub | null = null

export function getPubSubClient(): PubSub | null {
  if (!envVar.pubsub?.projectId) {
    console.warn('PubSub not configured: missing projectId')
    return null
  }

  if (!pubsubClient) {
    pubsubClient = new PubSub({
      projectId: envVar.pubsub.projectId,
    })
  }

  return pubsubClient
}

export interface VideoProcessingMessage {
  videoId: number
  filename: string
  action: 'process_duration' | 'delete_duration'
}

export async function publishVideoProcessingMessage(
  topicName: string,
  message: VideoProcessingMessage
): Promise<boolean> {
  try {
    const pubsub = getPubSubClient()
    if (!pubsub) {
      console.warn('PubSub client not available')
      return false
    }

    const topic = pubsub.topic(topicName)
    const messageBuffer = Buffer.from(JSON.stringify(message))
    
    const messageId = await topic.publish(messageBuffer)
    console.log(`Message ${messageId} published to ${topicName}`)
    return true
  } catch (error) {
    console.error('Error publishing message to PubSub:', error)
    return false
  }
}