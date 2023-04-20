import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'

const {
  allowRoles,
  admin,
  moderator,
  editor,
  contributor,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '套件',
    }),
    desc: text({
      label: '套件說明',
      ui: { displayMode: 'textarea' }
    }),
    relatedTopics: text({
      label: '使用到此套件的專題',
      ui: { displayMode: 'textarea' }
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
