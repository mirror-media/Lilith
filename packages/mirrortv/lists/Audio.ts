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

// 環境與 FFmpeg 配置
ffmpeg.setFfmpegPath(ffmpegInstaller.path)
ffmpeg.setFfprobePath(ffprobeInstaller.path)

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl
type GcsConfig = { bucket: string; projectId?: string; keyFilename?: string }
type FileField = { filename: string; filesize: number }

const gcsConfig = envVar.gcs as unknown as GcsConfig
const subDir = 'audios'

// Storage 初始化
let storage: Storage
let bucket: any
try {
  const resolvedKeyPath = gcsConfig.keyFilename
    ? path.resolve(process.cwd(), gcsConfig.keyFilename)
    : undefined
  storage = new Storage({
    projectId: gcsConfig.projectId,
    keyFilename: resolvedKeyPath,
  })
  bucket = storage.bucket(gcsConfig.bucket)
} catch (err) {
  console.error('[Audio] GCS Init Failed:', err)
}

// 媒體分析工具
const analyzeMedia = (
  filePath: string
): Promise<{ duration: number; raw: any }> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err)
      resolve({
        duration: metadata.format.duration
          ? Math.round(metadata.format.duration)
          : 0,
        raw: metadata,
      })
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
      if (fileData && fileData.filename) {
        const originalName = fileData.filename
        const tempPath = path.join(
          os.tmpdir(),
          `audio-${Math.random().toString(36).substring(7)}-${originalName}`
        )

        const baseDir = envVar.files.baseUrl.replace(/^\/|\/$/g, '') || 'files'
        const relativeFilePath = `${subDir}/${originalName}`
        const gcsPath = `${baseDir}/${relativeFilePath}`

        try {
          const storageRoot = envVar.files.storagePath || 'public/files'
          const absRoot = path.isAbsolute(storageRoot)
            ? storageRoot
            : path.join(process.cwd(), storageRoot)
          const srcPath = path.join(absRoot, originalName)
          const destDir = path.join(absRoot, subDir)
          const destPath = path.join(destDir, originalName)

          let readStream: NodeJS.ReadableStream
          if (fs.existsSync(srcPath)) {
            if (!fs.existsSync(destDir))
              fs.mkdirSync(destDir, { recursive: true })
            fs.renameSync(srcPath, destPath)
            readStream = fs.createReadStream(destPath)
          } else if (fs.existsSync(destPath)) {
            readStream = fs.createReadStream(destPath)
          } else if (bucket) {
            const gcsFile = bucket.file(gcsPath)
            if (!(await gcsFile.exists())[0])
              throw new Error(`File not found: ${gcsPath}`)
            readStream = gcsFile.createReadStream()
          } else {
            throw new Error(`File not found anywhere.`)
          }

          await pipeline(readStream, fs.createWriteStream(tempPath))
          const { duration, raw } = await analyzeMedia(tempPath)

          // 寫入完整路徑
          const fullUrl = gcsConfig?.bucket
            ? getFileURL(gcsConfig.bucket, baseDir, relativeFilePath)
            : `/${baseDir}/${relativeFilePath}`
          if (raw.format) raw.format.filename = fullUrl
          if (raw.streams && Array.isArray(raw.streams)) {
            raw.streams.forEach((stream: Record<string, any>) => {
              if (stream.filename) stream.filename = fullUrl
            })
          }

          resolvedData.duration = duration
          resolvedData.url = fullUrl
          resolvedData.meta = {
            originalFilename: originalName,
            filesize: fileData.filesize,
            format: raw.format,
            streams: raw.streams,
          }

          fileData.filename = relativeFilePath
        } catch (error) {
          console.error('[Audio] Hook Error:', error)
          const fallbackPath = `${subDir}/${originalName}`
          resolvedData.url = gcsConfig?.bucket
            ? getFileURL(gcsConfig.bucket, baseDir, fallbackPath)
            : `/${baseDir}/${fallbackPath}`
        } finally {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
        }
      }
      return resolvedData
    },

    afterOperation: async ({ operation, item }) => {
      if (operation === 'delete' && item && bucket) {
        const filename = (item as any).file?.filename
        if (filename) {
          try {
            const baseDir =
              envVar.files.baseUrl.replace(/^\/|\/$/g, '') || 'files'
            const gcsPath = `${baseDir}/${filename}`
            const gcsFile = bucket.file(gcsPath)
            if ((await gcsFile.exists())[0]) {
              await gcsFile.delete()
              console.log(`[Audio] Deleted GCS: ${gcsPath}`)
            }
          } catch (e) {
            console.error(`[Audio] Delete failed:`, e)
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
