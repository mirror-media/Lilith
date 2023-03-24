import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'

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
      label: '標題',
      validation: { isRequired: true },
    }),
    heroImage: customFields.relationship({
      label: '首圖',
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
    mobileHeroImageLink: text({
      label: '手機首圖網址',
    }),
    content: customFields.richTextEditor({
      label: '結果內容',
      disabledButtons: [],
      website: 'readr',
    }),
    form: relationship({
      ref: 'Form.answers',
      ui: {
        displayMode: 'display',
        linkToItem: true,
        inlineConnect: true,
      },
      many: false,
    }),
    conditionCollection: relationship({
      ref: 'ConditionCollection.answer',
      many: true,
    }),
  },
  ui: {
    // 為了讓ref到post的其他list在relationship field中能看見「slug」而非「name」
    // 此處將list的主要labelField設定成slug（預設為name）
    // 註：在他處的relationship中應該也能設定要顯示的labelField，但不知為何無作用
    // 註：若未來想要顯示[slug+標題]的格式，官方建議可用virturl field實作並在此處apply
    listView: {
      initialSort: { field: 'name', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'name',
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, contributor),
      create: allowRoles(admin, moderator, contributor),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
