import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, select, relationship } from '@keystone-6/core/fields'

const { allowRolesForUsers, admin, moderator, editor } = utils.accessControl

const typeOptions = [
  { value: 'legislator', label: '立法委員' },
  { value: 'party', label: '黨團' },
]

const listConfigurations = list({
  graphql: {
    plural: 'PeopleList',
  },
  fields: {
    type: select({
      label: '類型',
      options: typeOptions,
      validation: { isRequired: true },
    }),
    name: text({
      label: '姓名',
      validation: { isRequired: true },
    }),
    term: relationship({
      label: '屆',
      ref: 'Term',
    }),
    party: relationship({
      label: '政黨',
      ref: 'People',
    }),
    committees: relationship({
      label: '委員會',
      many: true,
      ref: 'Committee',
    }),
    description: text({
      label: '說明',
      ui: {
        displayMode: 'textarea',
      },
    }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'type', 'term', 'party'],
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
