import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, select, relationship, timestamp } from '@keystone-6/core/fields'
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({
      label: '中文名稱',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    status: select({
      label: '狀態',
      options: [
        { label: '已發布', value: 'published' },
        { label: '草稿', value: 'draft' },
        { label: '已下架', value: 'archived' },
      ],
    }),
    heroImage: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    desc: text({
      label: '內容',
      ui: {
        displayMode: 'textarea',
      },
    }),
    publishDate: timestamp({
      validation: {
        isRequired: true,
      },
      label: '發布時間',
    }),
    download: relationship({
      validation: {
        isRequired: true,
      },
      ref: 'Download.influence',
      ui: {
        hideCreate: true,
        displayMode: 'select',
        cardFields: ['name'],
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
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
