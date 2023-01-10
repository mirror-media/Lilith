import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    aboutUs: text({
      label: 'about us',
      ui: {
        displayMode: 'textarea',
      },
    }),
  },
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['id'],
    },
  },

  access: {
    operation: {
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
