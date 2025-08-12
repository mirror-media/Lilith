import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { integer, timestamp, text } from '@keystone-6/core/fields'

const { allowRolesForUsers, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    termNumber: integer({
      label: '第幾屆立法院',
      validation: { isRequired: true },
    }),
    startDate: timestamp({
      label: '起始年月日',
      validation: { isRequired: true },
    }),
    endDate: timestamp({
      label: '終止年月日',
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
      initialColumns: ['termNumber', 'startDate', 'endDate'],
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
