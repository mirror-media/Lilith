import { list } from '@keystone-6/core'
import { text, file } from '@keystone-6/core/fields'
import { utils } from '@mirrormedia/lilith-core'
import envVar from '../environment-variables'
import { getFileURL } from '../utils/common'

import fs from 'fs'
import path from 'path'
import { Storage, Bucket } from '@google-cloud/storage'

const { allowRoles, admin, moderator, editor } = utils.accessControl

// Types
type GcsConfig = {
  bucket: string
  projectId?: string
  keyFilename?: string
}
type FileField = {
  filename: string
  filesize: number
  mode?: string
  ref?: string
}

type DownloadItem = {
  id: string | number
  name?: string
  url?: string
  file_filename?: string
  file_filesize?: number
  createdAt?: string
}

const gcsConfig = envVar.gcs as unknown as GcsConfig
const subDir = 'documents'

// Init Google Cloud Storage
let bucket: Bucket | undefined
try {
  let keyPath = gcsConfig?.keyFilename
  if (keyPath) keyPath = path.resolve(process.cwd(), keyPath)

  if (gcsConfig?.bucket) {
    const storage = new Storage({
      projectId: gcsConfig.projectId,
      keyFilename: keyPath,
    })
    bucket = storage.bucket(gcsConfig.bucket)
  }
} catch (err) {
  console.error('[Download] GCS Init Error:', err)
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    file: file({
      label: '檔案(支援檔案類型:PDF word excel ppt)',
      storage: 'files',
    }),
    url: text({
      label: 'URL',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },

  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const fileData = resolvedData.file as FileField

      if (fileData && fileData.filename) {
        let originalName = fileData.filename

        if (originalName.startsWith(`${subDir}/`)) {
          originalName = originalName.replace(`${subDir}/`, '')
        }

        const baseDir = envVar.files.baseUrl.replace(/^\/|\/$/g, '') || 'files'
        const relativeFilePath = `${subDir}/${originalName}`

        try {
          const storageRoot = envVar.files.storagePath || 'public/files'
          const absRoot = path.isAbsolute(storageRoot)
            ? storageRoot
            : path.join(process.cwd(), storageRoot)

          const srcPath = path.join(absRoot, originalName)
          const destDir = path.join(absRoot, subDir)
          const destPath = path.join(destDir, originalName)

          if (fs.existsSync(srcPath) && srcPath !== destPath) {
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true })
            }
            fs.renameSync(srcPath, destPath)
            console.log(`[Download] Moved: ${srcPath} → ${destPath}`)
          } else if (fs.existsSync(destPath)) {
            console.log(`[Download] Already in place: ${destPath}`)
          }

          fileData.filename = relativeFilePath

          const fullUrl = gcsConfig?.bucket
            ? getFileURL(gcsConfig.bucket, baseDir, relativeFilePath)
            : `/${baseDir}/${relativeFilePath}`

          resolvedData.url =
            typeof fullUrl === 'string' ? fullUrl.replace(/\/+$/, '') : fullUrl

          console.log(`[Download] File: ${fileData.filename}`)
          console.log(`[Download] URL: ${resolvedData.url}`)
        } catch (e) {
          console.error('[Download] resolveInput Error:', e)
          const fallbackUrl = gcsConfig?.bucket
            ? getFileURL(gcsConfig.bucket, baseDir, relativeFilePath)
            : `/${baseDir}/${relativeFilePath}`
          resolvedData.url = fallbackUrl
        }
      }
      return resolvedData
    },

    afterOperation: async ({ operation, item, originalItem, context }) => {
      const newItem = item as DownloadItem
      if (operation === 'create' || operation === 'update') {
        if (newItem.name === 'tv-schedule' && newItem.file_filename) {
          if (!newItem.file_filename?.endsWith('.csv')) return
          const syncEndpoint = `${envVar.dataServiceApi}/tv-schedule/sync`
          const baseDir = envVar.files.baseUrl.replace(/^\//, '') // 'files'
          const blobName = `${baseDir}/${newItem.file_filename}`
          try {
            const response = await fetch(syncEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: blobName }),
            })
            if (!response.ok) {
              throw new Error(`Sync failed: ${response.status}`)
            }
            const result = await response.json()
            if (result.url) {
              await context.db.Download.updateOne({
                where: { id: String(newItem.id) },
                data: { url: result.url },
              })
              console.log(`[Download Hook] Updated URL to: ${result.url}`)
            }
          } catch (error) {
            console.error('[Download Hook] Sync Error:', error)
          }
        }
      }
      if (operation !== 'delete' || !originalItem) return

      const rawItem = originalItem as {
        file_filename?: string
        file?: { filename?: string }
      }

      let filename = rawItem.file_filename || rawItem.file?.filename
      if (!filename) return
      filename = filename.replace(/^\/+/g, '')

      try {
        const storageRoot = envVar.files.storagePath || 'public/files'
        const absRoot = path.isAbsolute(storageRoot)
          ? storageRoot
          : path.join(process.cwd(), storageRoot)
        const localPath = path.join(absRoot, filename)

        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
          console.log(`[Download] Local Deleted: ${localPath}`)
        }

        if (bucket) {
          const baseDir = (envVar.files.baseUrl || 'files').replace(
            /^\/+|\/+$/g,
            ''
          )
          const gcsPath = `${baseDir}/${filename}`
          const gcsFile = bucket.file(gcsPath)

          const [exists] = await gcsFile.exists()
          if (exists) {
            await gcsFile.delete()
            console.log(`[Download] GCS Deleted: ${gcsPath}`)
          }
        }
      } catch (e) {
        console.error('[Download] Delete failed:', e)
      }
    },
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'url', 'createdAt'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },

  graphql: {
    plural: 'Downloads',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
