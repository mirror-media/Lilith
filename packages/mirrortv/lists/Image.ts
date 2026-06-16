import { Storage } from '@google-cloud/storage'
import { CloudTasksClient, protos } from '@google-cloud/tasks'
import { list, graphql } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import {
  text,
  relationship,
  select,
  checkbox,
  image,
  json,
  virtual,
} from '@keystone-6/core/fields'
import envVar from '../environment-variables'
import { getFileURL } from '../utils/common'

const gcsBucket = new Storage().bucket(envVar.gcs.bucket)
const tasksClient = new CloudTasksClient()

async function enqueueCopyTask(source: string, dest: string) {
  if (!envVar.imageProcessor.url) {
    console.error(
      '[Image hook] IMAGE_PROCESSOR_URL is not configured. Skipping Cloud Tasks enqueue.'
    )
    return
  }
  try {
    const parent = tasksClient.queuePath(
      envVar.projectID,
      envVar.location,
      envVar.copyQueueName
    )
    const task = {
      httpRequest: {
        httpMethod: protos.google.cloud.tasks.v2.HttpMethod.POST,
        url: `${envVar.imageProcessor.url}/copy_blob`,
        headers: { 'Content-Type': 'application/json' },
        body: Buffer.from(
          JSON.stringify({
            key: envVar.imageProcessor.schedulerKey,
            bucket: envVar.gcs.bucket,
            source,
            dest,
          })
        ),
      },
    }
    const [response] = await tasksClient.createTask({ parent, task })
    console.log(
      `[Image hook] Enqueued copy task: ${source} → ${dest}: ${response.name}`
    )
  } catch (error) {
    console.error(
      `[Image hook] CRITICAL: copy failed AND enqueue failed, manual recovery needed: ${source} → ${dest}:`,
      error
    )
  }
}

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

const listConfigurations = list({
  db: {
    map: 'Image',
  },
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),

    file: image({
      label: '檔案',
      storage: 'images',
      ui: { views: './lists/views/custom-image/index' },
    }),

    copyright: select({
      label: '版權',
      options: [
        { label: 'Creative-Commons', value: 'Creative-Commons' },
        { label: 'Copyrighted', value: 'Copyrighted' },
      ],
      defaultValue: 'Copyrighted',
    }),

    topic: relationship({
      label: '專題',
      ref: 'Topic',
    }),

    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
    }),

    needWatermark: checkbox({
      label: 'Need watermark?',
      defaultValue: false,
    }),

    keywords: text({ label: '關鍵字' }),
    meta: text({
      label: '中繼資料',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    imageApiData: json({
      label: 'Image API Data (JSON)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    resized: virtual({
      field: graphql.field({
        type: graphql.object<{
          original: string
          w480: string
          w800: string
          w1200: string
          w1600: string
          w2400: string
        }>()({
          name: 'ResizedImages',
          fields: {
            original: graphql.field({ type: graphql.String }),
            w480: graphql.field({ type: graphql.String }),
            w800: graphql.field({ type: graphql.String }),
            w1200: graphql.field({ type: graphql.String }),
            w1600: graphql.field({ type: graphql.String }),
            w2400: graphql.field({ type: graphql.String }),
          },
        }),
        resolve(item: Record<string, any>) {
          const empty = {
            original: '',
            w480: '',
            w800: '',
            w1200: '',
            w1600: '',
            w2400: '',
          }

          const fileId = item.file_id
          const extension = item.file_extension
          const width = item.file_width
          const height = item.file_height

          if (!fileId || !extension) {
            return empty
          }

          const baseUrl = envVar.images.baseUrl
          const ext = `.${extension}`

          const resizedTargets =
            width >= height
              ? ['w480', 'w800', 'w1600', 'w2400']
              : ['w480', 'w800', 'w1200', 'w1600']

          const rtn: Record<string, string> = {}

          resizedTargets.forEach((target) => {
            rtn[target] = getFileURL(
              envVar.gcs.bucket,
              baseUrl,
              `${fileId}-${target}${ext}`
            )
          })

          rtn['original'] = getFileURL(
            envVar.gcs.bucket,
            baseUrl,
            `${fileId}${ext}`
          )
          return Object.assign(empty, rtn)
        },
      }),
      ui: {
        query: '{ original w480 w800 w1200 w1600 w2400 }',
      },
    }),

    resizedWebp: virtual({
      field: graphql.field({
        type: graphql.object<{
          original: string
          w480: string
          w800: string
          w1200: string
          w1600: string
          w2400: string
        }>()({
          name: 'ResizedWebPImages',
          fields: {
            original: graphql.field({ type: graphql.String }),
            w480: graphql.field({ type: graphql.String }),
            w800: graphql.field({ type: graphql.String }),
            w1200: graphql.field({ type: graphql.String }),
            w1600: graphql.field({ type: graphql.String }),
            w2400: graphql.field({ type: graphql.String }),
          },
        }),
        resolve(item: Record<string, any>) {
          const empty = {
            original: '',
            w480: '',
            w800: '',
            w1200: '',
            w1600: '',
            w2400: '',
          }

          const fileId = item.file_id
          const extension = item.file_extension
          const width = item.file_width
          const height = item.file_height

          if (!fileId || !extension) {
            return empty
          }

          const baseUrl = envVar.images.baseUrl
          const ext = `.webP`

          const resizedTargets =
            width >= height
              ? ['w480', 'w800', 'w1600', 'w2400']
              : ['w480', 'w800', 'w1200', 'w1600']

          const rtn: Record<string, string> = {}

          resizedTargets.forEach((target) => {
            rtn[target] = getFileURL(
              envVar.gcs.bucket,
              baseUrl,
              `${fileId}-${target}${ext}`
            )
          })

          rtn['original'] = getFileURL(
            envVar.gcs.bucket,
            baseUrl,
            `${fileId}${ext}`
          )
          return Object.assign(empty, rtn)
        },
      }),
      ui: {
        query: '{ original w480 w800 w1200 w1600 w2400 }',
      },
    }),
  },

  hooks: {
    afterOperation: async ({ operation, item, originalItem }) => {
      if (operation === 'delete') return
      if (!item?.file_id) return
      if (operation === 'update' && item.file_id === originalItem?.file_id)
        return

      if (!item.file_extension) return
      const filename = item.file_id as string
      const ext = `.${item.file_extension}`
      const gcsSourcePath = `images/${filename}${ext}`

      const width = typeof item.file_width === 'number' ? item.file_width : 0
      const height = typeof item.file_height === 'number' ? item.file_height : 0
      const targets =
        width >= height
          ? ['w480', 'w800', 'w1600', 'w2400']
          : ['w480', 'w800', 'w1200', 'w1600']

      await Promise.all(
        targets.map(async (target) => {
          const gcsDestPath = `images/${filename}-${target}${ext}`
          try {
            await gcsBucket
              .file(gcsSourcePath)
              .copy(gcsBucket.file(gcsDestPath))
            console.log(`[Image hook] Copied ${gcsSourcePath} → ${gcsDestPath}`)
          } catch (err) {
            console.error(
              `[Image hook] Copy failed, enqueuing retry: ${gcsDestPath}`,
              err
            )
            await enqueueCopyTask(gcsSourcePath, gcsDestPath)
          }
        })
      )
    },

    resolveInput: async ({ resolvedData, item }) => {
      // Get file metadata from new upload or existing record
      const fileId = resolvedData.file?.id || item?.file_id
      const extension = resolvedData.file?.extension || item?.file_extension
      const width = resolvedData.file?.width || item?.file_width
      const height = resolvedData.file?.height || item?.file_height

      // 填入 MIME Type 到 meta
      if (resolvedData.file?.extension) {
        const ext = resolvedData.file.extension.toLowerCase()
        const mimeMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
        }
        resolvedData.meta = mimeMap[ext] || `image/${ext}`
      }

      if (fileId && extension && width && height) {
        const baseUrl = envVar.images.baseUrl
        const bucket = envVar.gcs.bucket
        const ext = `.${extension}`

        const allPossibleTargets = [2400, 1600, 1200, 800, 480]

        const actualAvailableTargets =
          width >= height
            ? [2400, 1600, 800, 480] // 橫圖規格
            : [1600, 1200, 800, 480] // 直圖規格

        const originalUrl = getFileURL(bucket, baseUrl, `${fileId}${ext}`)

        // Fallback logic: find best available size (Target -> Smaller -> Original)
        const getBestFitUrl = (targetW: number) => {
          if (actualAvailableTargets.includes(targetW) && width >= targetW) {
            return {
              url: getFileURL(bucket, baseUrl, `${fileId}-w${targetW}${ext}`),
              w: targetW,
              h: Math.round(height * (targetW / width)),
            }
          }

          const fallbacks = allPossibleTargets
            .filter((t) => t < targetW)
            .sort((a, b) => b - a)

          for (const t of fallbacks) {
            if (actualAvailableTargets.includes(t) && width >= t) {
              return {
                url: getFileURL(bucket, baseUrl, `${fileId}-w${t}${ext}`),
                w: t,
                h: Math.round(height * (t / width)),
              }
            }
          }

          return { url: originalUrl, w: width, h: height }
        }

        const apiData: Record<string, any> = {
          url: originalUrl,
          original: { url: originalUrl, width, height },
        }

        allPossibleTargets.forEach((size) => {
          const result = getBestFitUrl(size)
          const key = `w${size}`
          apiData[key] = {
            url: result.url,
            width: result.w,
            height: result.h,
          }
        })

        resolvedData.imageApiData = apiData
      }

      return resolvedData
    },
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'file'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
