import { customFields, utils } from '@mirrormedia/lilith-core'
import { GcsFileAdapter } from '../utils/GcsFileAdapter'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const gcsFileAdapter = new GcsFileAdapter('audio')

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    file: customFields.file({
      label: '檔案',
      customConfig: {
        fileType: 'audio',
      },
    }),
    coverPhoto: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      customConfig: {
        isImage: true,
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
    url: text({
      label: '檔案網址',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    duration: text({
      label: '音檔長度（秒）',
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

  /*eslint-disable */
  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
/*eslint-disable */
  },
  hooks: {
    resolveInput: async ({ operation, inputData, item, resolvedData }) => {
      gcsFileAdapter.startFileProcessingFlow(resolvedData, item, inputData)

      return resolvedData
    },
    beforeOperation: async ({ operation, item }) => {
      if (operation === 'delete' && item.file_filename) {
        gcsFileAdapter.startDeleteProcess(`${item.file_filename}`)
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
