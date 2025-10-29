import config from '../config'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, file, virtual } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    description: text({
      label: '描述',
      ui: {
        displayMode: 'textarea',
      },
    }),
    file: file({
      label: 'PDF 檔案',
      storage: 'files',
    }),
    url: virtual({
      label: '檔案網址',
      field: graphql.field({
        type: graphql.String,
        async resolve(item) {
          const pdfFilename = item.file_filename
          return pdfFilename
            ? `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}/files/${pdfFilename}`
            : null
        },
      }),
    }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'description', 'file'],
      initialSort: {
        field: 'id',
        direction: 'DESC',
      },
      pageSize: 50,
    },
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
