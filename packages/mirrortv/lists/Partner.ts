import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    name: text({
      label: '中文名稱',
      validation: { isRequired: true },
      isIndexed: true,
    }),
    website: text({
      label: '網址',
    }),
    isPublic: checkbox({
      label: '公開',
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['slug', 'name', 'website', 'isPublic'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin),
      create: allowRoles(admin),
      delete: allowRoles(admin),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
