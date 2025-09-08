import { graphql, list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { timestamp, text, relationship, virtual } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

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
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const data = await context.query.Committee.findOne({
            where: { id: item.id },
            query: 'name session term { termNumber }',
          })
          const termNumber = data?.term?.termNumber
          const name = data?.name || ''
          const session = data?.session || ''
          return `${name}${termNumber ? ` 第${termNumber}屆` : ''}${session ? ` 第${session}會期` : ''}`
        },
      }),
      ui: {
        description: '供後台標籤顯示用',
        listView: { fieldMode: 'hidden' },
      },
    }),
  },

  ui: {
    labelField: 'displayName',
    listView: {
      initialColumns: ['displayName', 'session', 'startDate', 'endDate'],
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

export default listConfigurations
