import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { checkbox, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    name: text({
      label: '媒體名稱',
      validation: { isRequired: true },
      isIndexed: true,
    }),
    website: text({
      label: '網址',
      isIndexed: true,
    }),
    public: checkbox({
      label: '在 external 列表顯示資料',
      defaultValue: true,
    }),
    showOnIndex: checkbox({
      label: '是否顯示於首頁',
      defaultValue: true,
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'slug', 'website'],
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
