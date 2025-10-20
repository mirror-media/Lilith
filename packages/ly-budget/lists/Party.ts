import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '政黨名稱',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    color: text({
      label: '政黨代表色',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
  },

  ui: {
    listView: {
      initialColumns: ['name'],
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

