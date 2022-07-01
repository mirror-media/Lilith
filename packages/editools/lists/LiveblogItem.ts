import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  json,
  checkbox,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    status: select({
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'draft',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    publishTime: customFields.timestamp({
      label: '發布時間',
      customConfig: {
        hasNowButton: true,
        hideTime: false,
      },
    }),
    heroImage: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      customConfig: {
        isImage: true,
      },
    }),
    author: text({
      label: '作者',
    }),
    name: customFields.richTextEditor({
      label: '內文',
    }),
    boost: checkbox({
      label: '置頂',
      dfaultValue: false,
    }),
    liveblog: relationship({
      ref: 'Liveblog.liveblog_items',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    tags: relationship({
      ref: 'Tag.liveblog_items',
      ui: {
        displayMode: 'display',
        cardFields: ['name'],
        inlineCreate: { fields: ['name'] },
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    // 為了讓ref到post的其他list在relationship field中能看見「slug」而非「name」
    // 此處將list的主要labelField設定成slug（預設為name）
    // 註：在他處的relationship中應該也能設定要顯示的labelField，但不知為何無作用
    // 註：若未來想要顯示[slug+標題]的格式，官方建議可用virturl field實作並在此處apply
    listView: {
      initialColumns: ['title', 'liveblog', 'status', 'createdBy'],
      initialSort: { field: 'name', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'title',
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
    resolveInput: ({ resolvedData }) => {
      const { name } = resolvedData
      if (name) {
        const apiData = customFields.draftConverter.convertToApiData(name).toJS()
        resolvedData.apiData = apiData
      }
      return resolvedData
    },
    afterOperation: ({ operation, item, originalItem }) => {
      if (item.liveblogId) {
        if (
          operation == 'update' &&
          item.status == 'draft' &&
          originalItem.status != 'published'
        ) {
          return true
        }
        const query = 'query () {  }'
        console.log(query)
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
