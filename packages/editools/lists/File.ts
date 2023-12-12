import config from '../config'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { graphql } from '@graphql-ts/schema'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  file,
  json,
  virtual,
} from '@keystone-6/core/fields'

const { admin, allowRoles, moderator } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    file: file({
      label: '檔案',
      storage: 'files',
    }),
    FileSrc: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const filename = item?.file_filename
          if (!filename) {
            return ''
          }
          return `https://${config.files.gcsBaseUrl}/files/${filename}`
        },
      }),
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'file', 'fileSrc'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
