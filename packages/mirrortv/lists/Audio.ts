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

// 設定 FFmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

// --- 定義型別 ---
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

// --- 初始化 Storage ---
let storage: Storage
let bucket: any

try {
  let resolvedKeyPath = gcsConfig.keyFilename
  if (gcsConfig.keyFilename) {
    // 轉為絕對路徑，確保刪除功能有權限
    resolvedKeyPath = path.resolve(process.cwd(), gcsConfig.keyFilename)
  }
  storage = new Storage({
    projectId: gcsConfig.projectId,
    keyFilename: resolvedKeyPath,
  })
  bucket = storage.bucket(gcsConfig.bucket)
} catch (err) {
  console.error('[Audio] GCS Init Failed:', err)
}

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
      const fileData = resolvedData.file as FileField

      if (fileData) {
        const filename = fileData.filename
        const tempId = Math.random().toString(36).substring(7)
        const tempPath = path.join(os.tmpdir(), `audio-${tempId}-${filename}`)

        try {
          console.log(`[Audio] Processing: ${filename}`)

          // 定義路徑
          const storageRoot = envVar.files.storagePath || 'public/files'
          const absoluteStorageRoot = path.isAbsolute(storageRoot)
            ? storageRoot
            : path.join(process.cwd(), storageRoot)

          // Keystone 預設路徑
          const originalLocalPath = path.join(absoluteStorageRoot, filename)

          // 目標路徑 (files/audios/filename)
          const targetLocalDir = path.join(absoluteStorageRoot, 'audios')
          const targetLocalPath = path.join(targetLocalDir, filename)

          let readStream: NodeJS.ReadableStream

          if (fs.existsSync(originalLocalPath)) {
            console.log(`[Audio] Moving file to /audios...`)

            if (!fs.existsSync(targetLocalDir)) {
              fs.mkdirSync(targetLocalDir, { recursive: true })
            }
            fs.renameSync(originalLocalPath, targetLocalPath)
            console.log(`[Audio] Moved to: ${targetLocalPath}`)

            readStream = fs.createReadStream(targetLocalPath)
          } else if (fs.existsSync(targetLocalPath)) {
            console.log(`[Audio] File already in /audios.`)
            readStream = fs.createReadStream(targetLocalPath)
          } else if (bucket) {
            // GCS 下載
            const gcsBase = envVar.files.baseUrl
              ? envVar.files.baseUrl.replace(/^\//, '')
              : 'files'
            const gcsPath = `${gcsBase}/audios/${filename}`

            console.log(`[Audio] Downloading from GCS: ${gcsPath}`)
            const gcsFile = bucket.file(gcsPath)

            const [exists] = await gcsFile.exists()
            if (!exists) {
              throw new Error(
                `File not found locally AND not found in GCS: ${gcsPath}`
              )
            }
            readStream = gcsFile.createReadStream()
          } else {
            throw new Error(`File not found anywhere.`)
          }

          // 複製到 /tmp 進行分析
          await pipeline(readStream, fs.createWriteStream(tempPath))
          console.log(`[Audio] Temp file created at: ${tempPath}`)

          console.log(`[Audio] FFprobe analyzing...`)
          const { duration, raw } = await analyzeMedia(tempPath)
          console.log(`[Audio] Analysis Result: Duration ${duration}s`)

          // 更新資料庫
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
              `audios/${filename}`
            )
          } else {
            resolvedData.url = `/assets/audios/${filename}`
          }
        } catch (error) {
          console.error('[Audio] Analysis failed:', error)
          resolvedData.duration = 0
          resolvedData.meta = {
            error: 'Metadata analysis failed',
            details: (error as Error).message,
          }

          // Fallback URL
          if (gcsConfig && gcsConfig.bucket) {
            resolvedData.url = getFileURL(
              gcsConfig.bucket,
              envVar.files.baseUrl,
              `audios/${filename}`
            )
          } else {
            resolvedData.url = `/assets/audios/${filename}`
          }
        } finally {
          fs.unlink(tempPath, (err) => {
            if (err && err.code !== 'ENOENT')
              console.warn(`[Audio] Warning: Could not delete temp file`)
          })
        }
      }

      return resolvedData
    },

    afterOperation: async ({ operation, item }) => {
      if (operation === 'delete' && item && bucket) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileData = (item as any).file as FileField
        const filename = fileData?.filename

        if (filename) {
          try {
            // 刪除
            const gcsBase = envVar.files.baseUrl
              ? envVar.files.baseUrl.replace(/^\//, '')
              : 'files'
            const gcsPath = `${gcsBase}/audios/${filename}`

            const file = bucket.file(gcsPath)

            const [exists] = await file.exists()
            if (exists) {
              await file.delete()
              console.log(`[Audio] Deleted GCS file: ${gcsPath}`)
            }
          } catch (e) {
            console.error(`[Audio] Failed to delete GCS file:`, e)
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
