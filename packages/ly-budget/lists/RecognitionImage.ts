import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { relationship, text } from '@keystone-6/core/fields'

const { allowRolesForUsers, admin, moderator, editor } = utils.accessControl

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
      query: allowRolesForUsers(admin, moderator, editor),
      update: allowRolesForUsers(admin, moderator, editor),
      create: allowRolesForUsers(admin, moderator),
      delete: allowRolesForUsers(admin),
    },
  },
})

export default listConfigurations
