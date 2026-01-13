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

const gcsConfig = envVar.gcs as unknown as GcsConfig
const STORAGE_ROOT = envVar.files.storagePath || '/app/public/gcs-bucket/files'
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
    resolveInput: ({ resolvedData }) => {
      const fileData = resolvedData.file as FileField

      if (fileData && fileData.filename) {
        const filename = fileData.filename.replace(/^\/+/g, '')

        const baseDir = (envVar.files.baseUrl || 'files').replace(
          /^\/+|\/+$/g,
          ''
        )
        const cleanSubDir = subDir.replace(/^\/+|\/+$/g, '')
        const folderPath = `${baseDir}/${cleanSubDir}`

        try {
          if (gcsConfig?.bucket) {
            const generatedUrl = getFileURL(
              gcsConfig.bucket,
              folderPath,
              filename
            )
            if (typeof generatedUrl === 'string') {
              resolvedData.url = generatedUrl.replace(/\/+$/, '')
            } else {
              resolvedData.url = generatedUrl
            }
          } else {
            const baseUrl = (envVar.files.baseUrl || '').replace(/\/+$/, '')
            resolvedData.url = `${baseUrl}/${cleanSubDir}/${filename}`
          }
          console.log(`[Download] GCS upload: ${resolvedData.url}`)
        } catch (e) {
          console.error('[Download] resolveInput Error:', e)
        }
      }
      return resolvedData
    },

    afterOperation: async ({ operation, originalItem }) => {
      if (operation !== 'delete' || !originalItem) return

      const rawItem = originalItem as {
        file_filename?: string
        file?: { filename?: string }
      }

      let filename = rawItem.file_filename || rawItem.file?.filename
      if (!filename) return
      filename = filename.replace(/^\/+/g, '')

      try {
        const localPath = path
          .join(STORAGE_ROOT, subDir, filename)
          .replace(/\/+$/, '')

        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
          console.log(`[Download] FUSE Deleted: ${localPath}`)
        } else if (bucket) {
          const baseDir = (envVar.files.baseUrl || 'files').replace(
            /^\/+|\/+$/g,
            ''
          )
          const cleanSubDir = subDir.replace(/^\/+|\/+$/g, '')
          const gcsPath = `${baseDir}/${cleanSubDir}/${filename}`

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
