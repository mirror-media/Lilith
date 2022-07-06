import { list } from '@keystone-6/core'
import { text, select } from '@keystone-6/core/fields'
import { utils } from '@mirrormedia/lilith-core'
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '內容',
      ui: {
        displayMode: 'textarea',
      },
      validation: { isRequired: true, isUnique: true },
    }),
    status: select({
      options: [
        { label: '出版', value: 'published' },
        { label: '草稿', value: 'draft' },
        { label: '下架', value: 'archived' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'draft',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
      },
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

export default utils.addTrackingFields(listConfigurations)
