import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { relationship, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    meeting: relationship({
      label: '會議',
      ref: 'Meeting',
    }),
    imageUrl: text({
      label: '圖片 url',
      validation: { isRequired: true },
    }),
    description: text({
      label: '說明',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
  },

  ui: {
    listView: {
      initialColumns: ['meeting', 'imageUrl'],
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

export default listConfigurations
