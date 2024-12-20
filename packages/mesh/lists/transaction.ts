import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, checkbox, select, float, timestamp } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    member: relationship({ 
        label: "會員",
        ref: 'Member.transaction', 
        many: false
    }),
    policy: relationship({ 
        label: "交易政策",
        ref: 'Policy', 
        many: false 
    }),
    tid: text({
        label: '交易編號(TransactionID)',
        validation: {
            isRequired: false,
        },
    }),
    depositVolume: float({
        label: "儲值金額",
        validation: {
            isRequired: false,
        }
    }),
    unlockStory: relationship({ 
        label: "解鎖文章",
        ref: 'Story', 
        many: false 
    }),
    expireDate: timestamp({
        label: "到期日期",
        validation: { isRequired: false },
    }),
    active: checkbox({
        label: "是否仍於有效日期內",
        defaultValue: true,
    }),
    status: select({
        label: '交易狀態',
        type: 'enum',
        options: [
            {label: "成功", value: "Success"},
            {label: "失敗", value: "Failed"},
            {label: "處理中", value: "Processing"},
        ]
    }),
    complement: text({
        label: "備註",
        validation: {
            isRequired: false
        }
    }),

  },
  ui: {
    listView: {
      initialColumns: ['id', 'member', 'status', 'policy', 'tid'],
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  }
})

export default utils.addTrackingFields(listConfigurations)