import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, select, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const orderStateOptions = [
  { label: '待上傳素材', value: 'paid' },
  { label: '已上傳檔案', value: 'file_uploaded' },
  { label: '已確認素材', value: 'material_confirmed' },
  { label: '素材更新', value: 'material_updated' },
  { label: '已製作', value: 'produced' },
  { label: '影片確認', value: 'video_confirmed' },
  { label: '排播', value: 'scheduled' },
  { label: '已播出', value: 'broadcasted' },
  { label: '提出修改要求', value: 'modification_request' },
  { label: '待確認修改報價', value: 'pending_quote_confirmation' },
  { label: '已轉交', value: 'transferred' },
  { label: '待排播', value: 'pending_broadcast_date' },
  { label: '已取消', value: 'cancelled' },
]

const listConfigurations = list({
  fields: {
    member: relationship({
      label: '會員',
      ref: 'Member.orders',
    }),
    orderNumber: text({
      label: '訂單編號',
      validation: {
        isRequired: true,
      },
      isIndexed: 'unique',
    }),
    state: select({
      label: '狀態',
      options: orderStateOptions,
      defaultValue: 'paid',
    }),
    relatedOrder: relationship({
      label: '訂單更動',
      ref: 'Order',
      many: true,
    }),
    paragraphOne: text({
      label: '第一段文字',
      ui: {
        displayMode: 'textarea',
      },
    }),
    paragraphTwo: text({
      label: '第二段文字',
      ui: {
        displayMode: 'textarea',
      },
    }),
    image: relationship({
      label: '圖片素材',
      ref: 'Photo',
    }),
    demoImage: relationship({
      label: '成品樣圖',
      ref: 'Photo',
      many: true,
    }),
    schedule: text({
      label: '排程播出時間',
    }),
  },

  ui: {
    listView: {
      initialColumns: ['member', 'orderNumber', 'state', 'schedule'],
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
