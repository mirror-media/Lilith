import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  checkbox,
  text,
  timestamp,
  relationship,
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
      label: '使用者',
      validation: { isRequired: true },
    }),
    ip: text({
      label: 'IP',
    }),
    result: text({
      label: '回答內容',
    }),
    responseTime: timestamp({
      label: '填時間答',
    }),
    form: relationship({
      label: '所屬表單',
      ref: 'Form.result',
      ui: {
        displayMode: 'display',
        linkToItem: true,
        inlineConnect: true,
      },
      many: false,
    }),
    field: relationship({
      label: '欄位',
      ref: 'Field.result',
      ui: {
        displayMode: 'display',
        linkToItem: true,
        inlineConnect: true,
      },
      many: false,
    }),
    uri: text({
      label: 'URI',
    }),
    hidden: checkbox({
      label: '隱藏該結果',
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
