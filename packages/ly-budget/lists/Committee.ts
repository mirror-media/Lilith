import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { timestamp, text, relationship, virtual } from '@keystone-6/core/fields'

const { allowRolesForUsers, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    term: relationship({
      label: '第幾屆立法院',
      ref: 'Term',
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
    session: text({
      label: '會期',
      validation: { isRequired: true },
    }),
    name: text({
      label: '委員會名稱',
      validation: { isRequired: true },
    }),
    members: relationship({
      label: '立委成員',
      many: true,
      ref: 'People',
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
    displayName: virtual({
      label: '顯示名稱',
      field: {
        query: 'name term { termNumber }',
        resolver: (item) => {
          return `${item.name}(${item.term?.termNumber})`
        },
      },
    }),
  },

  ui: {
    listView: {
      initialColumns: ['displayName', 'session', 'startDate', 'endDate'],
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
