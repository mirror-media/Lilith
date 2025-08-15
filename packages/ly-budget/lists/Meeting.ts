import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, select, timestamp, relationship } from '@keystone-6/core/fields'

const { allowRolesForUsers, admin, moderator, editor } = utils.accessControl

const locationOptions = [
  { value: 'committee', label: '委員會' },
  { value: 'plenary', label: '院會' },
  { value: 'negotiation', label: '黨團協商' },
]

const typeOptions = [
  { value: 'budget_review', label: '預算審議' },
  { value: 'budget_unfreeze', label: '預算解凍' },
]

const listConfigurations = list({
  fields: {
    location: select({
      label: '地點',
      options: locationOptions,
      validation: { isRequired: true },
    }),
    type: select({
      label: '類型',
      options: typeOptions,
      validation: { isRequired: true },
    }),
    committee: relationship({
      label: '委員會',
      ref: 'Committee',
    }),
    meetingDate: timestamp({
      label: '會議日期',
      validation: { isRequired: true },
    }),
    meetingRecordUrl: text({
      label: '會議記錄連結',
      db: {
        isNullable: true,
      },
    }),
    description: text({
      label: '說明',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
  },

  ui: {
    listView: {
      initialColumns: ['meetingDate', 'location', 'type', 'committee'],
    },
  },
  access: {
    operation: {
      query: allowRolesForUsers(admin, moderator, editor),
      update: allowRolesForUsers(admin, moderator, editor),
      create: allowRolesForUsers(admin, moderator),
      delete: allowRolesForUsers(admin),
    },
  },
})

export default listConfigurations
