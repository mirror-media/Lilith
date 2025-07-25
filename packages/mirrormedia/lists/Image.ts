import envVar from '../environment-variables'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { file, image, text, select, virtual, checkbox } from '@keystone-6/core/fields'
import { getFileURL } from '../utils/common'

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
        itemView: { fieldMode: 'hidden' },
      },
    }),
    watermarkType: select({
      label: '',
      options: [
        { label: '鏡週刊', value: 'mirrormedia' },
        { label: '鏡報', value: 'mirrordaily' },
      ],
      defaultValue: 'mirrormedia',
      isIndexed: false,
    }),
    waterMarkDescription: virtual({
      label: '浮水印',
      ui: {
        createView: { fieldMode: 'hidden' },
      },
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          return item.waterMark
            ? '此圖片已含有浮水印，嵌入文章時會自動顯示，如需修改，請刪除後重新上傳'
            : '此圖片不含有浮水印，如需修改，請刪除後重新上傳'
        },
      }),
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
    file: file({
      label: '檔案（建議長邊大於 2000 pixel）',
      storage: 'files',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
        listView: {
          fieldMode: 'read',
        },
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
