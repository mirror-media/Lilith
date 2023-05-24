import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  checkbox,
  json,
  text,
  select,
  relationship,
  timestamp,
} from '@keystone-6/core/fields'
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    title: text({
      label: '問題內容',
      validation: { isRequired: true },
      isIndexed: 'unique',
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
    publishTime: timestamp({
      label: '發布時間',
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor),
          update: allowRoles(admin, moderator),
          create: allowRoles(admin, moderator),
          delete: allowRoles(admin),
        },
      },
    }),
    imageLink: text(),
    author: text({
      label: '作者',
    }),
    content: customFields.richTextEditor({
      label: '內文',
      disabledButtons: [],
      website: 'readr',
    }),
    boost: checkbox({
      label: '置頂',
      dfaultValue: false,
    }),
    subject: relationship({
      ref: 'Tag.questionSection',
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
      ref: 'Tag.questions',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    form: relationship({
      ref: 'Form.questions',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
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
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hook: {
    resolveInput: ({ resolvedData }) => {
      const { name } = resolvedData
      if (name) {
        const apiData = customFields.draftConverter
          .convertToApiData(name)
          .toJS()
        resolvedData.apiData = apiData
      }
      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
