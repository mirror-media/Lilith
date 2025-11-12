import config from '../config'
// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { image, text, virtual } from '@keystone-6/core/fields'

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
    imageFile: image({
      storage: 'images',
    }),
    url: virtual({
      label: '圖片網址',
      field: graphql.field({
        type: graphql.String,
        async resolve(item) {
          // For backward compatibility,
          // this image item is uploaded via `GCSFile` custom field.
          if (item?.urlOriginal) {
            return item.urlOriginal as string
          }

          const filename = item?.imageFile_id
          if (!filename) {
            return null
          }

          const extension = item?.imageFile_extension
            ? '.' + item.imageFile_extension
            : ''

          return `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}/images/${filename}${extension}`
        },
      }),
      ui: {
        views: './lists/views/image-url-cell/index',
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlOriginal: text({
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
  },
  ui: {
    listView: {
      initialColumns: ['name', 'imageFile'],
      initialSort: {
        // @ts-ignore: `updatedAt` field does exist
        field: 'updatedAt',
        direction: 'ASC',
      },
      pageSize: 50,
    },
  },
  graphql: {
    cacheHint: { maxAge: 1200, scope: 'PUBLIC' },
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
