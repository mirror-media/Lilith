import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import path from 'path'
import envVar from '../environment-variables'
import { processAndUploadImages, deleteImagesFromGCS } from './imageProcessing'

// Redis 設定
const redisUrl = envVar.redis?.url || 'redis://localhost:6379'
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

// 建立 Queue
export const imageQueue = new Queue('imageProcessingQueue', { connection })

// 啟動 Worker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const startImageWorker = (context: any) => {
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
