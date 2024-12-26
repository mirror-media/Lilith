import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, select, float} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    publisher: relationship({ 
        label: "媒體",
        ref: 'Publisher.exchange', 
        many: false
    }),
    tid: text({
        label: '交易編號(TransactionID)',
        validation: {
            isRequired: false,
        },
    }),
    exchangeVolume: float({
        label: "兌換金額",
        validation: {
            isRequired: true,
        }
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
      initialColumns: ['id', 'publisher', 'status', 'exchangeVolume', 'tid'],
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