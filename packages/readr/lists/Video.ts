// @ts-ignore: no definition
import config from '../config'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, virtual, file } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator } = utils.accessControl

// import { GcsFileAdapter } from '../utils/GcsFileAdapter'

// const gcsFileAdapter = new GcsFileAdapter('video')

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
      label: '檔案'
    }),
    coverPhoto: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
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
          return `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}/files/${audioUrl}`
        },
      })
    }),
    duration: text({
      label: '影片長度（秒）',
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
