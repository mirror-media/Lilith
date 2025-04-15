import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin } = utils.accessControl

const listConfigurations = list({
  fields: {
    keyword: text({
      label: '關鍵詞',
      validation: {
        isRequired: true,
      },
    }),
    posts: relationship({
      ref: 'Post.groups',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
      },
    }),
    externals: relationship({
      ref: 'External.groups',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
      },
    }),
  },
  ui: {
    labelField: 'keyword',
    listView: {
      initialColumns: ['id', 'keyword', 'createdAt'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin),
      create: allowRoles(admin),
      delete: allowRoles(admin),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
