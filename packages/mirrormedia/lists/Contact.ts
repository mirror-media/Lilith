import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      isIndexed: true,
      label: '作者姓名',
      validation: { isRequired: true },
    }),
    content: text({
      label: '敘述',
      ui: { displayMode: 'textarea' },
    }),
    sections: relationship({
      label: '大分類',
      ref: 'Section',
      many: true,
      ui: {
        labelField: 'name',
      },
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'sections'],
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
