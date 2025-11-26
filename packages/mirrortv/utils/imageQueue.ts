import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import path from 'path'
import envVar from '../environment-variables'
import { processAndUploadImages, deleteImagesFromGCS } from './imageProcessing'
import { KeystoneContext } from '@keystone-6/core/types'

let connection: IORedis | null = null
let imageQueue: Queue | null = null

// 初始化 Queue 函式
const initializeQueue = async () => {
  if (imageQueue) return imageQueue

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
    // 防止在初始化時立即連線
    lazyConnect: true,
    // 防止在連線失敗時無限重試
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
  console.log('[Redis] Connected successfully')

  // 建立 Queue
  imageQueue = new Queue('imageProcessingQueue', { connection })
  return imageQueue
}

export { imageQueue }

// 啟動 Worker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const startImageWorker = async (context: KeystoneContext) => {
  await initializeQueue()

  if (!connection || !imageQueue) {
    throw new Error('[Redis] Connection not established')
  }

  const worker = new Worker(
    'imageProcessingQueue',
    async (job: Job) => {
      const {
        type,
        itemId,
        fileId,
        extension,
        needWatermark,
        oldFileId,
        oldExtension,
      } = job.data
      console.log(
        `[ImageWorker] Job ${job.id} (${type}) started for ${itemId || fileId}`
      )

      try {
        if (type === 'upload') {
          // 處理上傳與縮圖
          const localFilePath = path.join(
            envVar.images.storagePath,
            `${fileId}.${extension}`
          )

          // 執行處理
          const apiData = await processAndUploadImages(
            localFilePath,
            fileId,
            extension,
            needWatermark
          )

          // 寫回資料庫
          await context.sudo().db.Image.updateOne({
            where: { id: itemId },
            data: {
              urlOriginal: apiData.original.url,
              urlDesktopSized: apiData.desktop.url,
              urlTabletSized: apiData.tablet.url,
              urlMobileSized: apiData.mobile.url,
              urlTinySized: apiData.tiny.url,
              imageApiData: apiData,
            },
          })

          console.log(`[ImageWorker] DB Updated for ${itemId}`)
        }

        // 刪除 (Update 換圖或 Delete 刪除)
        if (oldFileId && oldExtension) {
          await deleteImagesFromGCS(oldFileId, oldExtension)
          console.log(`[ImageWorker] Old GCS files deleted: ${oldFileId}`)
        }
      } catch (err) {
        console.error(`[ImageWorker] Failed:`, err)
        throw err
      }
    },
    { connection, concurrency: 2 }
  )
  return worker
}
