import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import envVar from '../environment-variables'
import { secondsToISO8601Duration } from './duration-format'
import { getVideoFileDuration } from './video-duration'
import { KeystoneContext } from '@keystone-6/core/types'

let connection: IORedis | null = null
let videoQueue: Queue | null = null

// 初始化 Queue
export const initializeQueue = async () => {
  if (videoQueue) return videoQueue

  const redisUrl = envVar.redis?.url

  if (!redisUrl) {
    throw new Error('[Redis] Redis URL not configured')
  }

  if (redisUrl.includes('127.0.0.1') || redisUrl.includes('localhost')) {
    console.warn(
      '[Redis] Using localhost Redis - this should only be in development'
    )
  }

  connection = new IORedis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      if (times > 5) {
        console.warn('[Redis] Max retries reached')
        return null
      }
      return Math.min(times * 50, 2000)
    },
  })

  connection.on('error', (err) => {
    console.warn(`[Redis] Connection error: ${err.message}`)
  })

  await connection.connect()
  console.log('[Redis] Connected successfully (Video Queue)')

  videoQueue = new Queue('videoDurationQueue', { connection })
  return videoQueue
}

export { videoQueue }

// 定義並啟動 Worker
export const startVideoWorker = async (context: KeystoneContext) => {
  await initializeQueue()

  if (!connection || !videoQueue) {
    throw new Error('[Redis] Video Queue Connection not established')
  }

  const worker = new Worker(
    'videoDurationQueue',
    async (job: Job) => {
      const { videoId, filename } = job.data
      console.log(
        `[VideoWorker] Start processing video: ${videoId}, file: ${filename}`
      )

      try {
        const durationSec = await getVideoFileDuration(filename)
        if (durationSec === null) {
          throw new Error(`Failed to calculate duration for file: ${filename}`)
        }

        // 轉換 ISO 格式
        const durationISO = secondsToISO8601Duration(durationSec)

        console.log(
          `[VideoWorker] Calculated: ${durationSec}s (${durationISO})`
        )

        // 更新資料庫
        await context.sudo().db.Video.updateOne({
          where: { id: videoId },
          data: {
            duration: durationSec,
            fileDuration_internal: durationISO,
          },
        })

        console.log(`[VideoWorker] Database updated for video ${videoId}`)
      } catch (error) {
        console.error(`[VideoWorker] Error processing video ${videoId}:`, error)
        throw error
      }
    },
    {
      connection,
      concurrency: 2,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[VideoWorker] Job ${job?.id} failed: ${err.message}`)
  })

  return worker
}
