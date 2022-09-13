import { customFields, utils } from '@mirrormedia/lilith-core'
import { GcsFileAdapter } from '../utils/GcsFileAdapter'
import { list } from '@keystone-6/core'
import { text, relationship, file, json } from '@keystone-6/core/fields'

const { admin, allowRoles, moderator } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    file: file({
      label: '檔案',
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
    }),
    content: customFields.richTextEditor({
      label: '敘述',
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
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
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
