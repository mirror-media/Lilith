// @ts-ignore: no definition
import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, json, timestamp, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    post: relationship({
      label: '專題',
      ref: 'Post.note',
      many: true,
    }),
    title: text({
      label: '標題',
    }),
    writers: relationship({
      ref: 'Author.notes',
      many: true,
      label: '作者',
    }),
    category: relationship({
      ref: 'NoteCategory.note',
      many: true,
      label: '分類',
    }),
    publishTime: timestamp({
      isIndexed: true,
      label: '發佈日期',
    }),
    content: customFields.richTextEditor({
      label: '內文',
      website: 'readr',
      disabledButtons: [],
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
      query: allowRoles(admin, moderator, editor),
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
