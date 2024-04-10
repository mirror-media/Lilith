import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, timestamp, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator } = utils.accessControl

const listConfigurations = list({
  fields: {
    keyword: text({
        label: '關鍵詞',
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
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    validateInput: ({ resolvedData, addValidationError }) => {
        const { keyword } = resolvedData
        if (keyword === '') {
          addValidationError('keyword 不得為空值')
        }
      },
  },
})
export default utils.addTrackingFields(listConfigurations)