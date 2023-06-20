import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  json,
  integer,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    type: select({
      label: '欄位型態',
      type: 'enum',
      options: [
        {
          label: '單選',
          value: 'single',
        },
        {
          label: '複選',
          value: 'multiple',
        },
        {
          label: '文字框',
          value: 'text',
        },
        {
          label: 'checkbox',
          value: 'checkbox',
        },
      ],
      validation: { isRequired: true },
    }),
    status: select({
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      defaultValue: 'draft',
      ui: {
        displayMode: 'segmented-control',
      },
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
    heroImageLink: text({
      label: '首圖網址',
    }),
    content: customFields.richTextEditor({
      label: '內文',
      disabledButtons: [],
      website: 'readr',
    }),
    sortOrder: integer({
      label: '排序',
      dfaultValue: false,
    }),
    form: relationship({
      ref: 'Form.fields',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    options: relationship({
      ref: 'FieldOption.field',
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'content', 'value'],
        inlineEdit: {
          fields: ['name', 'heroImage', 'content', 'value', 'sortOrder'],
        },
        linkToItem: true,
        removeMode: true,
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: {
          fields: ['name', 'heroImage', 'content', 'value', 'sortOrder'],
        },
      },
      many: true,
    }),
    conditionCollection: relationship({
      ref: 'ConditionCollection.next',
      many: true,
    }),
    condition: relationship({
      ref: 'Condition.formField',
      many: true,
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    result: relationship({
      ref: 'FormResult.field',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
      },
      many: true,
    }),
  },
  ui: {
    listView: {
      initialSort: { field: 'name', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'name',
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
