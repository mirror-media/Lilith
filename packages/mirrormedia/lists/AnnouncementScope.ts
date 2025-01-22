import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '範圍名稱',
      isIndexed: 'unique',
      db: {
        isNullable: false,
      },
      validation: {
        isRequired: true,
      },
      ui: {
        displayMode: 'input',
      },
    }),
    description: text({
      label: '範圍說明',
      db: {
        isNullable: false,
      },
      validation: {
        isRequired: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
  },
  hooks: {},
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'description'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
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
