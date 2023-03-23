import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  checkbox,
  json,
} from '@keystone-6/core/fields'

const {
  allowRoles,
  admin,
  moderator,
  editor,
  contributor,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: {
        isRequired: true,
      },
    }),
    slug: text({
      label: 'Slug（必填）',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    type: select({
      label: '表格型態',
      type: 'enum',
      options: [
        {
          label: 'QA',
          value: 'qa',
        },
        {
          label: 'form',
          value: 'form',
        },
        {
          label: 'questionniare',
          value: 'questionniare',
        },
        {
          label: 'quiz',
          value: 'quiz',
        },
      ],
      validation: { isRequired: true },
    }),
    content: customFields.richTextEditor({
      label: '描述',
      disabledButtons: [],
      website: 'readr',
    }),
    heroImage: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      customConfig: {
        isImage: true,
      },
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor, contributor),
          update: allowRoles(admin, moderator, contributor),
          create: allowRoles(admin, moderator, contributor),
          delete: allowRoles(admin),
        },
      },
    }),
    mobileImage: customFields.relationship({
      label: '手機首圖',
      ref: 'Photo',
      customConfig: {
        isImage: true,
      },
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor),
          update: allowRoles(admin, moderator),
          create: allowRoles(admin, moderator),
          delete: allowRoles(admin),
        },
      },
    }),
    heroImageLink: text({
      label: '首圖網址',
    }),
    mobileImageLink: text({
      label: '手機首圖網址',
    }),
    heroVideo: customFields.relationship({
      label: '首屏影片',
      ref: 'Video',
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor),
          update: allowRoles(admin, moderator),
          create: allowRoles(admin, moderator),
          delete: allowRoles(admin),
        },
      },
    }),
    heroVideoLink: text({
      label: '首屏影片網址',
    }),
    active: checkbox({ label: '啟用', defaultValue: true }),
    fields: relationship({
      ref: 'Field.form',
      ui: {
        displayMode: 'cards',
        cardFields: ['name'],
        linkToItem: true,
        removeMode: true,
        inlineEdit: { fields: ['name', 'status', 'sortOrder', 'type'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: {
          fields: [
            'name',
            'status',
            'heroImage',
            'content',
            'sortOrder',
            'type',
          ],
        },
      },
      many: true,
    }),
    answers: relationship({
      ref: 'FormAnswer.form',
      ui: {
        displayMode: 'cards',
        cardFields: ['name'],
        linkToItem: true,
        removeMode: true,
        inlineCreate: { fields: ['name', 'heroImage', 'content'] },
        inlineEdit: { fields: ['name', 'heroImage', 'content'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
      },
      many: true,
    }),
    updateTimeDesc: text({
      label: '更新時間說明（若空白則顯示「最後更新時間」）',
    }),
    updateTime: customFields.timestamp({
      label: '最後更新時間',
      customConfig: {
        hasNowButton: true,
        hideTime: false,
      },
    }),
    questions: relationship({
      ref: 'Question.form',
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
      many: true,
    }),
    tags: relationship({
      ref: 'Tag.form',
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
      many: true,
    }),
    conditions: relationship({
      ref: 'ConditionCollection.form',
      ui: {
        displayMode: 'display',
        cardFields: ['id'],
        inlineCreate: { fields: ['id'] },
        inlineEdit: { fields: ['id'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['id'] },
      },
      many: true,
    }),
    publisher: relationship({
      ref: 'Publisher.form',
      ui: {
        displayMode: 'display',
        cardFields: ['name'],
        inlineCreate: { fields: ['name', 'publishTime', 'heroImage'] },
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
      },
      many: false,
    }),
    result: relationship({
      ref: 'FormResult.form',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
      },
      many: true,
    }),
    feedback: text({
      label: 'Feednack form（embedded）',
      ui: { displayMode: 'textarea' },
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
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = draftConverter.convertToApiData(content).toJS()
      }
      delete resolvedData.postPreviewButton
      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
