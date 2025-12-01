import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  text,
  file,
  relationship,
  select,
  timestamp,
  virtual,
  integer,
} from '@keystone-6/core/fields'
import envVar from '../environment-variables'
import { getYouTubeDuration } from '../utils/video-duration'
import { secondsToISO8601Duration } from '../utils/duration-format'
import { getFileURL } from '../utils/common'

// 引入 Queue
import { initializeQueue } from '../utils/videoQueue'

const { allowRoles, admin, moderator, editor, contributor, owner } =
  utils.accessControl

enum VideoState {
  Draft = 'draft',
  Published = 'published',
  Scheduled = 'scheduled',
}

type VideoItem = {
  id: string | number
  name?: string
  youtubeUrl?: string | null
  file_filename?: string | null
  fileDuration_internal?: string | null
  youtubeDuration_internal?: string | null
  duration?: number
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    youtubeUrl: text({
      label: 'Youtube網址',
    }),
    file: file({
      label: '檔案',
      storage: 'videos',
    }),
    duration: integer({
      label: '影片長度（秒）',
      defaultValue: 0,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    fileDuration_internal: text({
      label: '影片檔案時長(ISO 8601)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    youtubeDuration_internal: text({
      label: 'YouTube影片時長(ISO 8601)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    categories: relationship({
      label: '分類',
      ref: 'Category',
      many: true,
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
    }),
    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: VideoState.Draft },
        { label: 'Published', value: VideoState.Published },
        { label: 'Scheduled', value: VideoState.Scheduled },
      ],
      defaultValue: VideoState.Draft,
      isIndexed: true,
    }),
    publishTime: timestamp({
      label: '發佈時間',
    }),

    fileDuration: virtual({
      label: '影片檔案時長',
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const video = item as unknown as VideoItem
          if (!video.file_filename) return 'PT0S'

          const v = video.fileDuration_internal
          return v && v !== '0' ? v : 'PT0S'
        },
      }),
    }),
    youtubeDuration: virtual({
      label: 'YouTube影片時長',
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const video = item as unknown as VideoItem
          if (!video.youtubeUrl) return 'PT0S'

          const v = video.youtubeDuration_internal
          return v && v !== '0' ? v : 'PT0S'
        },
      }),
    }),
    videoSrc: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const video = item as unknown as VideoItem

          // YouTube Url，回傳 Url
          if (video.youtubeUrl) {
            return video.youtubeUrl
          }

          // 檔案，回傳 GCS 路徑
          const filename = video.file_filename
          if (filename) {
            return getFileURL(
              envVar.gcs.bucket,
              envVar.videos.baseUrl,
              filename
            )
          }

          return ''
        },
      }),
    }),
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'state', 'duration', 'publishTime'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor, owner),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },

  hooks: {
    validateInput: async ({ resolvedData, addValidationError }) => {
      const hasYoutube =
        typeof resolvedData.youtubeUrl === 'string' &&
        resolvedData.youtubeUrl.length > 0
      const fileData = resolvedData.file
      const isUploadingNewFile =
        fileData !== undefined &&
        fileData !== null &&
        (fileData as { filename: string }).filename

      if (isUploadingNewFile && hasYoutube) {
        addValidationError(
          '錯誤：不能同時設定「YouTube網址」與「上傳檔案」，請擇一輸入。'
        )
      }
    },

    resolveInput: async ({ resolvedData, item }) => {
      const inputData = { ...resolvedData }

      if (inputData.youtubeUrl === undefined) {
        return inputData
      }

      //  YouTube URL logic
      if (typeof inputData.youtubeUrl === 'string') {
        const url = inputData.youtubeUrl.trim()

        if (url === '') {
          inputData.youtubeUrl = ''
          inputData.youtubeDuration_internal = 'PT0S'

          const existingItem = item as unknown as VideoItem | undefined
          if (existingItem?.youtubeUrl) {
            inputData.duration = 0
          }
          return inputData
        }

        const existingItem = item as unknown as VideoItem | undefined
        const isUrlChanged = url !== existingItem?.youtubeUrl
        const isNewItem = !existingItem
        const isDurationMissing = existingItem?.duration === 0

        if (isUrlChanged || isNewItem || isDurationMissing) {
          console.log('[Video Hook] Fetching YouTube duration for:', url)
          try {
            const duration = await getYouTubeDuration(url)

            if (duration && duration > 0) {
              inputData.duration = duration
              inputData.youtubeDuration_internal =
                secondsToISO8601Duration(duration)
            } else {
              inputData.duration = 0
              inputData.youtubeDuration_internal = 'PT0S'
            }
          } catch (error) {
            console.error(
              '[Video Hook] Error fetching YouTube duration:',
              error
            )
            inputData.duration = 0
            inputData.youtubeDuration_internal = 'PT0S'
          }
        }

        if (inputData.file === undefined) {
          if (existingItem?.file_filename) {
            inputData.file = null
          } else {
            delete inputData.file
          }
        }

        inputData.fileDuration_internal = 'PT0S'
      }
      console.log(inputData)
      return inputData
    },

    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (operation !== 'create' && operation !== 'update') return

      const newItem = item as unknown as VideoItem
      const oldItem = originalItem as unknown as VideoItem | undefined

      const newFilename = newItem?.file_filename
      const oldFilename = oldItem?.file_filename

      const isNewFileUploaded =
        newFilename && (operation === 'create' || newFilename !== oldFilename)

      if (isNewFileUploaded && newItem?.id) {
        console.log(
          `[Video Hook] New file uploaded: ${newFilename}. Adding to queue...`
        )

        try {
          const queue = await initializeQueue()
          await queue.add('calculateDuration', {
            videoId: newItem.id,
            filename: newFilename,
          })
        } catch (error) {
          console.error('[Video Hook] Failed to add job to queue:', error)
        }
      }
      const isFileRemoved = oldFilename && !newFilename
      if (isFileRemoved) {
        console.log(`[Video Hook] File removed. Resetting duration to 0.`)

        await context.db.Video.updateOne({
          where: { id: String(newItem.id) },
          data: {
            duration: 0,
            fileDuration_internal: 'PT0S',
          },
        })
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
