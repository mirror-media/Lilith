import envVar from '../environment-variables'
import { list, graphql } from '@keystone-6/core'
import { image, text, virtual } from '@keystone-6/core/fields'
import { utils } from '@mirrormedia/lilith-core'
import { getFileURL } from '../utils/common'
const { allowRoles, admin, moderator, editor } = utils.accessControl

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
      storage: 'images',
      ui: { views: './lists/views/custom-image/index' },
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

          const rtn : Record<string, string> = {}
          const filename = item?.file_id

          if (!filename) {
            return empty
          }

          const extension = item?.file_extension
            ? '.' + item.file_extension
            : ''
          const width = typeof item?.file_width === 'number' ? item.file_width : 0
          const height = typeof item?.file_height === 'number' ? item.file_height : 0

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
          const filename = item?.file_id

          if (!filename) {
            return empty
          }

          const extension = '.webP'

          const width =
            typeof item?.file_width === 'number' ? item.file_width : 0
          const height =
            typeof item?.file_height === 'number'
              ? item.file_height
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
    urlOriginal: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        // itemView: { fieldMode: 'read' },
      },
    }),
  },
  ui: {
    listView: {
      initialColumns: ['name', 'urlOriginal'],
      initialSort: { field: 'updatedAt', direction: 'ASC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },

})

export default utils.addTrackingFields(listConfigurations)
