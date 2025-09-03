import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, select, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const orderTypeOptions = [
  { label: '求婚', value: 'proposal' },
  { label: '成功故事', value: 'success_story' },
]

const orderStateOptions = [
  { label: '已付款', value: 'paid' },
  { label: '已上傳檔案', value: 'file_uploaded' },
  { label: '已確認素材', value: 'material_confirmed' },
  { label: '素材更新', value: 'material_updated' },
  { label: '已製作', value: 'produced' },
  { label: '影片確認', value: 'video_confirmed' },
  { label: '排播', value: 'scheduled' },
  { label: '已播出', value: 'broadcasted' },
]

const listConfigurations = list({
  fields: {
    member: relationship({
      label: '會員',
      ref: 'Member',
      validation: { isRequired: true },
    }),
    type: select({
      label: '類型',
      options: orderTypeOptions,
      validation: { isRequired: true },
    }),
    state: select({
      label: '狀態',
      options: orderStateOptions,
      defaultValue: 'paid',
      validation: { isRequired: true },
    }),
    relatedOrder: relationship({
      label: '訂單更動',
      ref: 'Order',
      many: true,
      db: {
        isNullable: true,
      },
    }),
    paragraphOne: text({
      label: '第一段文字',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
    paragraphTwo: text({
      label: '第二段文字',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
    image: relationship({
      label: '圖片素材',
      ref: 'Photo',
      db: {
        isNullable: true,
      },
    }),
    demoImage: relationship({
      label: '成品樣圖',
      ref: 'Photo',
      many: true,
      db: {
        isNullable: true,
      },
    }),
    schedule: text({
      label: '排程播出時間',
      db: {
        isNullable: true,
      },
    }),
  },

  ui: {
    listView: {
      initialColumns: ['member', 'type', 'state', 'schedule', 'createdAt'],
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

export default utils.addTrackingFields(listConfigurations)
