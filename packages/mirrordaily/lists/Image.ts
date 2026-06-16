import { Storage } from '@google-cloud/storage'
import { CloudTasksClient, protos } from '@google-cloud/tasks'
import envVar from '../environment-variables'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { image, text, virtual, checkbox } from '@keystone-6/core/fields'
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

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  db: {
    map: 'Image',
  },
  fields: {
    name: text({
      label: 'name',
      validation: { isRequired: true },
    }),
    imageFile: image({
      storage: 'images',
      ui: { views: './lists/views/custom-image/index' },
    }),
    waterMark: checkbox({
      label: '浮水印',
      defaultValue: false,
      ui: {
        itemView: { fieldMode: 'read' },
      },
    }),
    defaultImage: checkbox({
      label: '預設圖',
      defaultValue: false,
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
        resolve(item: Record<string, unknown>) {
          const empty = {
            original: '',
            w480: '',
            w800: '',
            w1200: '',
            w1600: '',
            w2400: '',
          }

          // For backward compatibility,
          // this image item is uploaded via `GCSFile` custom field.
          if (item?.urlOriginal) {
            return Object.assign(empty, {
              original: item.urlOriginal,
            })
          }

          const rtn: Record<string, string> = {}
          const filename = item?.imageFile_id

          if (!filename) {
            return empty
          }

          const extension = item?.imageFile_extension
            ? '.' + item.imageFile_extension
            : ''
          const width =
            typeof item?.imageFile_width === 'number' ? item.imageFile_width : 0
          const height =
            typeof item?.imageFile_height === 'number'
              ? item.imageFile_height
              : 0

          const resizedTargets =
            width >= height
              ? ['w480', 'w800', 'w1600', 'w2400']
              : ['w480', 'w800', 'w1200', 'w1600']

          resizedTargets.forEach((target) => {
            rtn[target] = getFileURL(
              envVar.gcs.bucket,
              envVar.images.baseUrl,
              `${filename}-${target}${extension}`
            )
          })

          rtn['original'] = getFileURL(
            envVar.gcs.bucket,
            envVar.images.baseUrl,
            `${filename}${extension}`
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
        resolve(item: Record<string, unknown>) {
          const empty = {
            original: '',
            w480: '',
            w800: '',
            w1200: '',
            w1600: '',
            w2400: '',
          }

          // For backward compatibility,
          // this image item is uploaded via `GCSFile` custom field.
          if (item?.urlOriginal) {
            return Object.assign(empty, {
              original: item.urlOriginal,
            })
          }

          const rtn: Record<string, string> = {}
          const filename = item?.imageFile_id

          if (!filename) {
            return empty
          }

          const extension = '.webP'

          const width =
            typeof item?.imageFile_width === 'number' ? item.imageFile_width : 0
          const height =
            typeof item?.imageFile_height === 'number'
              ? item.imageFile_height
              : 0

          const resizedTargets =
            width >= height
              ? ['w480', 'w800', 'w1600', 'w2400']
              : ['w480', 'w800', 'w1200', 'w1600']

          resizedTargets.forEach((target) => {
            rtn[target] = getFileURL(
              envVar.gcs.bucket,
              envVar.images.baseUrl,
              `${filename}-${target}${extension}`
            )
          })

          rtn['original'] = getFileURL(
            envVar.gcs.bucket,
            envVar.images.baseUrl,
            `${filename}${extension}`
          )
          return Object.assign(empty, rtn)
        },
      }),
      ui: {
        query: '{ original w480 w800 w1200 w1600 w2400 }',
      },
    }),
    topicKeywords: text({
      label: 'topic keyword ( 首圖小slideshow上稿：@-網址 )',
      validation: { isRequired: false },
    }),
    copyRight: checkbox({
      label: '版權',
    }),
  },
  hooks: {
    afterOperation: async ({ operation, item, originalItem }) => {
      if (operation === 'delete') return
      if (!item?.imageFile_id) return
      if (
        operation === 'update' &&
        item.imageFile_id === originalItem?.imageFile_id
      )
        return

      if (!item.imageFile_extension) return
      const filename = item.imageFile_id as string
      const ext = `.${item.imageFile_extension}`
      const gcsSourcePath = `images/${filename}${ext}`

      const width =
        typeof item.imageFile_width === 'number' ? item.imageFile_width : 0
      const height =
        typeof item.imageFile_height === 'number' ? item.imageFile_height : 0
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
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'imageFile'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator, editor),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
