import { list, graphql } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import {
  text,
  relationship,
  select,
  checkbox,
  file,
  json,
  virtual,
} from '@keystone-6/core/fields'
import path from 'path'
import envVar from '../environment-variables'
import { PubSub } from '@google-cloud/pubsub'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

const TEST_MODE = false
// Pub/Sub client
let pubSubClient: PubSub | null = null
if (!TEST_MODE) {
  pubSubClient = new PubSub({ projectId: envVar.googleCloud.projectId })
}
const topicName = envVar.googleCloud.imageResizeTopic
// 發送訊息到 Pub/Sub
export async function publishImageTask(taskData: any) {
  if (TEST_MODE) {
    console.log(
      '[Pub/Sub][TEST MODE] Would publish message:',
      JSON.stringify(taskData, null, 2)
    )
    return 'test-message-id'
  }

  if (!pubSubClient) {
    throw new Error('[Pub/Sub] PubSub client not initialized')
  }

  try {
    const topic = pubSubClient.topic(topicName)
    const messageBuffer = Buffer.from(JSON.stringify(taskData))

    const messageId = await topic.publishMessage({
      data: messageBuffer,
      attributes: {
        type: taskData.type,
        itemId: taskData.itemId || '',
      },
    })

    console.log(
      `[Pub/Sub] Message ${messageId} published for ${taskData.type} operation`
    )
    return messageId
  } catch (error) {
    console.error('[Pub/Sub] Error publishing message:', error)
    throw error
  }
}

const listConfigurations = list({
  db: {
    map: 'Image',
  },
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    file: file({
      label: '檔案',
      storage: 'images',
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
    }),
    keywords: text({ label: '關鍵字' }),
    meta: text({ label: '中繼資料' }),

    // URL 相關欄位 (read only)
    urlOriginal: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlDesktopSized: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlTabletSized: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlMobileSized: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlTinySized: text({
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
    // Virtual Field
    resized: virtual({
      field: graphql.field({
        type: graphql.object<{
          original: string
          desktop: string
          tablet: string
          mobile: string
          tiny: string
        }>()({
          name: 'ResizedImages',
          fields: {
            original: graphql.field({ type: graphql.String }),
            desktop: graphql.field({ type: graphql.String }),
            tablet: graphql.field({ type: graphql.String }),
            mobile: graphql.field({ type: graphql.String }),
            tiny: graphql.field({ type: graphql.String }),
          },
        }),
        // 回傳資料庫已經存好的 URL
        resolve(item: Record<string, any>) {
          return {
            original: item.urlOriginal || '',
            desktop: item.urlDesktopSized || '',
            tablet: item.urlTabletSized || '',
            mobile: item.urlMobileSized || '',
            tiny: item.urlTinySized || '',
          }
        },
      }),
      // 必須設定 ui.query 避免 Admin UI 報錯
      ui: {
        query: '{ original desktop tablet mobile tiny }',
      },
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'createdAt'],
      initialSort: { field: 'id', direction: 'DESC' },
    },
  },
  hooks: {
    validateInput: async ({ operation, inputData, addValidationError }) => {
      if (
        (operation === 'create' || operation === 'update') &&
        inputData.file
      ) {
        const { upload } = inputData.file

        if (upload) {
          const { filename } = await upload
          const ext = path.extname(filename).toLowerCase()

          // 檢查是否在允許列表中
          if (!ALLOWED_EXTENSIONS.includes(ext)) {
            addValidationError(
              `檔案格式錯誤："${filename}"。只允許上傳圖片檔 (${ALLOWED_EXTENSIONS.join(
                ', '
              )})`
            )
          }
        }
      }
    },

    afterOperation: async ({ operation, item, originalItem }) => {
      type ImageItem = {
        id: string
        file_filename?: string
        needWatermark?: boolean
      }

      const newItem = item as ImageItem
      const oldItem = originalItem as ImageItem | undefined

      //  create 或 update 時，檢查是否有新檔案被上傳
      if (operation === 'create' || operation === 'update') {
        const newFilename = newItem.file_filename
        const oldFilename = oldItem?.file_filename

        if (
          newFilename &&
          (operation === 'create' || newFilename !== oldFilename)
        ) {
          const parsed = path.parse(newFilename)
          const fileId = parsed.name
          const extension = parsed.ext.replace('.', '')

          // 舊檔案資訊(檔名/副檔名)
          let oldFileId
          let oldExtension

          if (oldFilename) {
            const oldParsed = path.parse(oldFilename)
            oldFileId = oldParsed.name
            oldExtension = oldParsed.ext.replace('.', '')
          }
          // 發送訊息到 Pub/Sub
          await publishImageTask({
            type: 'upload',
            itemId: newItem.id,
            fileId: fileId,
            extension: extension,
            needWatermark: newItem.needWatermark,
            oldFileId,
            oldExtension,
          })
        }
      }

      // 刪除
      if (operation === 'delete' && oldItem?.file_filename) {
        const parsed = path.parse(oldItem.file_filename)

        // 發送刪除訊息到 Pub/Sub
        await publishImageTask({
          type: 'delete',
          oldFileId: parsed.name,
          oldExtension: parsed.ext.replace('.', ''),
        })
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
