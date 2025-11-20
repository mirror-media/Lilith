import { list } from '@keystone-6/core'
import { text, select, timestamp } from '@keystone-6/core/fields'
import { utils } from '@mirrormedia/lilith-core'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'Slug',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    name: text({
      label: '標題',
      validation: { isRequired: true },
      defaultValue: 'untitled',
    }),
    subtitle: text({
      label: '副標',
    }),
    state: select({
      label: '狀態',
      type: 'enum',
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
        { label: 'scheduled', value: 'scheduled' },
        { label: 'archived', value: 'archived' },
        { label: 'invisible', value: 'invisible' },
      ],
      defaultValue: 'draft',
      access: {
        create: allowRoles(admin, moderator, editor),
        update: allowRoles(admin, moderator, editor),
      },
    }),
    publishTime: timestamp({
      label: '發佈時間',
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },
  ui: {
    listView: {
      initialColumns: ['slug', 'name', 'state', 'publishTime'],
      initialSort: { field: 'publishTime', direction: 'DESC' },
    },
  },
  graphql: {
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
