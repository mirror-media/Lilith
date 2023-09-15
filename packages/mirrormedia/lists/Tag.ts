import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    name: text({
      isIndexed: 'unique',
      label: '標籤名稱',
      validation: { isRequired: true },
    }),
    posts: relationship({
      ref: 'Post.tags',
      many: true,
      ui: { hideCreate: true },
    }),
    topics: relationship({
      ref: 'Topic.tags',
      many: true,
      ui: { hideCreate: true },
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'slug', 'posts'],
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
