// @ts-ignore: no definition
import config from '../config'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, virtual, file } from '@keystone-6/core/fields'

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
    description: text({
      label: '描述',
      ui: {
        displayMode: 'textarea',
      },
    }),
    // todo
    tags: text({
      label: '標籤',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    meta: text({
      label: '中繼資料',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    url: virtual({
      label: '檔案網址',
      field: graphql.field({
        type: graphql.String,
        async resolve(item) {
          const audioUrl = item.file_filename
          return audioUrl
            ? `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}/files/${audioUrl}`
            : null
        },
      }),
    }),
    duration: text({
      label: '長度（秒）',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
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

  hooks: {
    // resolveInput: async ({ inputData, item, resolvedData }) => {
    //   // @ts-ignore: item might be undefined, should be handle properly
    //   gcsFileAdapter.startFileProcessingFlow(resolvedData, item, inputData)
    //   return resolvedData
    // },
    // beforeOperation: async ({ operation, item }) => {
    //   if (operation === 'delete' && item.file_filename) {
    //     gcsFileAdapter.startDeleteProcess(`${item.file_filename}`)
    //   }
    // },
  },
})

export default utils.addTrackingFields(listConfigurations)
