import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, select, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const memberStateOptions = [
  { label: '啟用', value: 'active' },
  { label: '停用', value: 'inactive' },
]

const listConfigurations = list({
  fields: {
    firebaseID: text({
      label: 'firebase id',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    email: text({
      label: 'email',
      isIndexed: 'unique',
      isFilterable: true,
      db: {
        isNullable: true,
      },
    }),
    state: select({
      label: '狀態',
      options: memberStateOptions,
      defaultValue: 'active',
      validation: { isRequired: true },
    }),
    name: text({
      label: '姓名',
      db: {
        isNullable: true,
      },
    }),
    mobile: text({
      label: '手機號碼',
      db: {
        isNullable: true,
      },
    }),
    orders: relationship({
      label: '訂單',
      ref: 'Order.member',
      many: true,
    }),
  },
  hooks: {
    validateInput: async ({ resolvedData, addValidationError, item }) => {
      if (
        !resolvedData.email &&
        !resolvedData.mobile &&
        !item?.email &&
        !item?.mobile
      ) {
        addValidationError('email 或 mobile 至少需要填寫一個')
      }
    },
  },
  ui: {
    listView: {
      initialColumns: ['firebaseID', 'email', 'state', 'name', 'mobile'],
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
