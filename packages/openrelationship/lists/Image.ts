import config from '../config'
// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  file,
  image,
  text,
  relationship,
  virtual,
} from '@keystone-6/core/fields'

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
    resized: virtual({
      field: graphql.field({
        type: graphql.object<{
          original: string
        }>()({
          name: 'ResizedImages',
          fields: {
            original: graphql.field({ type: graphql.String }),
          },
        }),
        resolve(item: Record<string, unknown>) {
          const empty = {
            original: '',
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

          rtn[
            'original'
          ] = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}/images/${filename}${extension}`
          return Object.assign(empty, rtn)
        },
      }),
      ui: {
        query: '{ original }',
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
