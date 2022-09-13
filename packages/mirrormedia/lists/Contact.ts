import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';

const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      isIndexed: true,
      label: '作者姓名',
      validation: { isRequired: true }
    }),
    content: text({
      label: '敘述',
      ui: { displayMode: 'textarea' }
    }),
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
