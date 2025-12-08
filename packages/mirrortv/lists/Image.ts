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
    meta: text({ label: '中繼資料' }),

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
            rtn[target] = `${baseUrl}${fileId}-${target}${ext}`
          })

          rtn['original'] = `${baseUrl}${fileId}${ext}`
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
            rtn[target] = `${baseUrl}${fileId}-${target}${ext}`
          })

          rtn['original'] = `${baseUrl}${fileId}${ext}`
          return Object.assign(empty, rtn)
        },
      }),
      ui: {
        query: '{ original w480 w800 w1200 w1600 w2400 }',
      },
    }),
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
