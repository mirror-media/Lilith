import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, select, timestamp } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    mobileImage: customFields.relationship({
      label: '手機用圖片',
      ref: 'Photo',
      customConfig: {
        isImage: true,
      },
      many: false,
    }),
    tabletImage: customFields.relationship({
      label: '平板用圖片',
      ref: 'Photo',
      customConfig: {
        isImage: true,
      },
      many: false,
    }),
    desktopImage: customFields.relationship({
      label: '桌機用圖片',
      ref: 'Photo',
      customConfig: {
        isImage: true,
      },
      many: false,
    }),
    url: text({
      label: '網址',
      validation: {
        isRequired: true,
      },
    }),
    page: select({
      label: '所屬頁面',
      type: 'string',
      options: [
        {
          label: '首頁',
          value: 'home',
        },
        {
          label: '文章頁',
          value: 'article',
        },
      ],
      validation: { isRequired: true },
    }),
    register_start: timestamp({
      label: '開始時間',
      validation: {
        isRequired: true,
      },
    }),
    register_end: timestamp({
      label: '結束時間',
      validation: {
        isRequired: true,
      },
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
