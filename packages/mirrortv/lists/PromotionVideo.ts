import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { select, integer, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '影片名稱',
      validation: { isRequired: true },
    }),
    sortOrder: integer({
      label: '排序順位',
      isIndexed: 'unique',
    }),
    ytUrl: text({
      label: 'Youtube影片',
      validation: { isRequired: true },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Scheduled', value: 'scheduled' },
      ],
      defaultValue: 'draft',
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'sortOrder', 'state'],
      initialSort: { field: 'sortOrder', direction: 'DESC' },
      pageSize: 50,
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
