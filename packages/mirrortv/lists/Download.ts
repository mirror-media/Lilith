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

// Init Storage
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
        const filename = fileData.filename

        if (gcsConfig?.bucket) {
          resolvedData.url = getFileURL(
            gcsConfig.bucket,
            envVar.files.baseUrl,
            filename
          )
        } else {
          const baseUrl = envVar.files.baseUrl.endsWith('/')
            ? envVar.files.baseUrl
            : `${envVar.files.baseUrl}/`
          resolvedData.url = `${baseUrl}${filename}`
        }
      }
      return resolvedData
    },

    afterOperation: async ({ operation, item, originalItem }) => {
      const targetItem = operation === 'delete' ? originalItem : item
      if (operation !== 'delete' || !targetItem) return

      const rawItem = targetItem as {
        file_filename?: string
        file?: { filename?: string }
      }
      const filename = rawItem.file_filename || rawItem.file?.filename
      if (!filename) return

      try {
        // 刪除 GCS 檔案
        if (bucket) {
          const file = bucket.file(filename)

          const [exists] = await file.exists()
          if (exists) {
            await file.delete()
            console.log(`[Download] Deleted GCS: ${filename}`)
          }
        }
        // 刪除 Local 檔案
        else {
          const storageRoot = envVar.files.storagePath || 'public/files'
          const localPath = path.resolve(process.cwd(), storageRoot, filename)

          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath)
            console.log(`[Download] Deleted Local: ${localPath}`)
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
