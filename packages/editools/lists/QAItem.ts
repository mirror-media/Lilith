import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { integer, text } from '@keystone-6/core/fields'
const {
  allowRoles,
  admin,
  moderator,
  editor,
  contributor,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({
      label: '問題內容',
      validation: { isRequired: true },
    }),
    content: customFields.richTextEditor({
      label: '內文',
      disabledButtons: [
        'slideshow',
        'table',
        'annotation',
        'divider',
        'info-box',
        'link',
      ],
      website: 'readr',
    }),
    sortOrder: integer({
      label: '優先順序',
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, contributor),
      create: allowRoles(admin, moderator, contributor),
      delete: allowRoles(admin),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
