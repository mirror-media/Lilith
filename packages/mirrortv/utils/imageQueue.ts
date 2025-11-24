import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import path from 'path'
import envVar from '../environment-variables'
import { processAndUploadImages, deleteImagesFromGCS } from './imageProcessing'

// Redis 設定
const redisUrl = envVar.redis?.url || 'redis://localhost:6379'

// ★ 修改: Connection 設定，防止 Build 階段報錯
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  // 加入 retryStrategy: 限制重試次數
  retryStrategy: (times) => {
    // 如果重試超過 5 次，就放棄連線 (這對 build 階段很重要)
    if (times > 5) {
      console.warn(
        '[Redis] Max retries reached. Assuming build environment or Redis down.'
      )
      return null
    }
    return Math.min(times * 50, 2000)
  },
})

// ★ 修改: 捕捉錯誤事件，防止 Node.js 拋出 Unhandled Exception 導致 Build 失敗
connection.on('error', (err) => {
  console.warn(
    `[Redis] Connection error: ${err.message} (This is expected during build step)`
  )
})

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
