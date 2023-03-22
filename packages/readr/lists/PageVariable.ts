import { list } from '@keystone-6/core'
// @ts-ignore: no definition
import { customFields, utils } from '@mirrormedia/lilith-core'
import { text, select, relationship } from '@keystone-6/core/fields'

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
    relatedImage: relationship({
      label: '圖片',
      ref: 'Photo',
    }),
    value: customFields.richTextEditor({
      label: '內容',
      disabledButtons: [],
      website: 'readr',
    }),
    page: select({
      label: '所屬頁面',
      options: [
        { label: '關於我們', value: 'about' },
        { label: 'About Us', value: 'about-en' },
        { label: '隱私權', value: 'privacy' },
      ],
      defaultValue: 'about',
      isIndexed: true,
    }),
    url: text({
      label: 'URL',
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
