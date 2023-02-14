import { list } from '@keystone-6/core'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { text, select } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({
      label: '欄位名稱',
      validation: { isRequired: true },
    }),
    value: customFields.richTextEditor({
      label: '內容',
      disabledButtons: [],
    }),
    page: select({
      label: '所屬頁面',
      options: [
        { label: '關於我們', value: 'about' },
        { label: '隱私權', value: 'privacy' },
      ],
      defaultValue: 'about',
      isIndexed: true,
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
