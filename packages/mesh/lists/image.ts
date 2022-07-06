import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'
import { customFields, utils } from '@mirrormedia/lilith-core'
const { allowRoles, admin, moderator, editor } = utils.accessControl

import { CustomFile } from '../../customFields'
import { ImageFileAdapter } from '../../customFields/CustomFile/ImageFileAdapter'

const imageFileAdapter = new ImageFileAdapter('image')

const listConfigurations = list({
  db: {
    map: 'Image',
  },
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    file: CustomFile({
      label: '檔案（建議長邊大於 2000 pixel）',
      customConfig: {
        fileType: 'image',
      },
    }),
    urlOriginal: text({
      ui: {
        // createView: { fieldMode: 'hidden' },
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

  hooks: {
    resolveInput: async ({ inputData, item, resolvedData }) => {
      await imageFileAdapter.startFileProcessingFlow(
        resolvedData,
        item,
        inputData
      )

      return resolvedData
    },
    // beforeOperation: async ({ operation, item }) => {
    //   if (operation === 'delete' && item.file_filename) {
    //     imageFileAdapter.startDeleteProcess(`${item.file_filename}`)
    //   }
    // },
  },
})

export default utils.addTrackingFields(listConfigurations)
