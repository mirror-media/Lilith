import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  file,
  integer,
  json,
} from '@keystone-6/core/fields'
import { allowAll } from '@keystone-6/core/access'
import { utils } from '@mirrormedia/lilith-core'
import envVar from '../environment-variables'
import { getFileURL } from '../utils/common'

import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { pipeline } from 'stream/promises'
import { Storage } from '@google-cloud/storage'

// 設定 FFmpeg 執行路徑
ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

// 定義型別問題
type GcsConfig = {
  bucket: string
  projectId?: string
  keyFilename?: string
}
type FileField = {
  filename: string
  filesize: number
}
const gcsConfig = envVar.gcs as unknown as GcsConfig

// 輔助：分析 Audio 檔案
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const analyzeMedia = (
  filePath: string
): Promise<{ duration: number; raw: any }> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err)
      }
      const duration = metadata.format.duration
        ? Math.round(metadata.format.duration)
        : 0
      resolve({ duration, raw: metadata })
    })
  })
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),

    file: file({
      label: '檔案',
      storage: 'files',
    }),

    coverPhoto: relationship({
      label: '封面照片',
      ref: 'Image',
    }),

    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
    }),

    meta: json({
      label: '中繼資料',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    url: text({
      label: '檔案網址',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    duration: integer({
      label: '音檔長度（秒）',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  access: {
    operation: {
      query: allowAll,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },

  hooks: {
    resolveInput: async ({ resolvedData }) => {
      // 檢查 resolvedData.file 是否存在
      const fileData = resolvedData.file as FileField

      if (fileData) {
        const filename = fileData.filename

        // 產生隨機 ID 用於暫存檔
        const tempId = Math.random().toString(36).substring(7)
        const tempPath = path.join(os.tmpdir(), `audio-${tempId}-${filename}`)

        try {
          console.log(
            `[Audio] New file detected: ${filename}. Fetching for analysis...`
          )

          // 判斷檔案位置 (GCS/Local) 建立讀取串流
          const localStorageRoot = envVar.files.storagePath || 'public/files'
          const localFilePath = path.join(
            process.cwd(),
            localStorageRoot,
            filename
          )

          let readStream: NodeJS.ReadableStream

          if (fs.existsSync(localFilePath)) {
            console.log(`[Audio] Source: Local Filesystem (${localFilePath})`)
            readStream = fs.createReadStream(localFilePath)
          }
          // 本地沒有且有設定 GCS 去 GCS 抓
          else if (gcsConfig && gcsConfig.bucket) {
            console.log(`[Audio] Source: GCS Bucket (${gcsConfig.bucket})`)

            const storage = new Storage({
              projectId: gcsConfig.projectId,
              keyFilename: gcsConfig.keyFilename,
            })
            const bucket = storage.bucket(gcsConfig.bucket)
            const pathPrefix = envVar.files.storagePath
              ? `${envVar.files.storagePath}/`
              : ''
            const gcsFile = bucket.file(`${pathPrefix}${filename}`)

            readStream = gcsFile.createReadStream()
          } else {
            throw new Error(
              `File not found in local path and no GCS config provided.`
            )
          }

          // 將檔案下載/複製到暫存區 (/tmp)
          await pipeline(readStream, fs.createWriteStream(tempPath))
          console.log(`[Audio] Temp file created at: ${tempPath}`)

          // 使用 FFmpeg 分析暫存檔
          console.log(`[Audio] FFprobe analyzing...`)
          const { duration, raw } = await analyzeMedia(tempPath)
          console.log(`[Audio] Analysis Result: Duration ${duration}s`)

          // 更新資料庫欄位
          resolvedData.duration = duration
          resolvedData.meta = {
            originalFilename: filename,
            filesize: fileData.filesize,
            format: raw.format,
            streams: raw.streams,
          }

          // 設定 URL
          if (gcsConfig && gcsConfig.bucket) {
            resolvedData.url = getFileURL(
              gcsConfig.bucket,
              envVar.files.baseUrl,
              filename
            )
          } else {
            resolvedData.url = `assets/audios/${filename}`
          }
        } catch (error) {
          console.error('[Audio] Analysis failed:', error)
          // Given default value if error happens
          resolvedData.duration = 0
          resolvedData.meta = {
            error: 'Metadata analysis failed',
            details: (error as Error).message,
          }

          if (filename) {
            if (gcsConfig && gcsConfig.bucket) {
              resolvedData.url = getFileURL(
                gcsConfig.bucket,
                envVar.files.baseUrl,
                filename
              )
            } else {
              resolvedData.url = `/assets/audios/${filename}`
            }
          }
        } finally {
          // clean temp file
          fs.unlink(tempPath, (err) => {
            if (err && err.code !== 'ENOENT')
              console.warn(
                `[Audio] Warning: Could not delete temp file ${tempPath}`
              )
          })
        }
      }

      return resolvedData
    },

    afterOperation: async ({ operation, item }) => {
      if (operation === 'delete' && item && gcsConfig && gcsConfig.bucket) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileData = (item as any).file as FileField
        const filename = fileData?.filename

        if (filename) {
          try {
            const storage = new Storage({
              projectId: gcsConfig.projectId,
              keyFilename: gcsConfig.keyFilename,
            })
            const bucket = storage.bucket(gcsConfig.bucket)
            const pathPrefix = envVar.files.storagePath
              ? `${envVar.files.storagePath}/`
              : ''
            const file = bucket.file(`${pathPrefix}${filename}`)

            const [exists] = await file.exists()
            if (exists) {
              await file.delete()
              console.log(`[Audio] Deleted GCS file: ${filename}`)
            }
          } catch (e) {
            console.error(`[Audio] Failed to delete GCS file (non-fatal):`, e)
          }
        }
      }
    },
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'tags', 'duration', 'url'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },

  graphql: {
    plural: 'Audios',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
