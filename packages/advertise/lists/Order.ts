import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, select, relationship, checkbox } from '@keystone-6/core/fields'

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
  hooks: {
    resolveInput: ({ resolvedData, operation, item }) => {
      if (operation === 'create' && !item && !resolvedData.updatedAt) {
        resolvedData.updatedAt = new Date()
      }

      // << 只要 item 或 resolvedData 的 relatedOrder 有內容就自動設為 transferred >>
      const extractRelatedOrderLength = (o?: unknown) => {
        if (!o) return 0
        if (Array.isArray(o)) return o.length
        const oo = o as { connect?: unknown[]; set?: unknown[] }
        if (Array.isArray(oo.connect) && oo.connect.length > 0)
          return oo.connect.length
        if (Array.isArray(oo.set) && oo.set.length > 0) return oo.set.length
        return 0
      }
      if (
        extractRelatedOrderLength(resolvedData.relatedOrder) > 0 ||
        extractRelatedOrderLength(item?.relatedOrder) > 0
      ) {
        resolvedData.state = 'transferred'
      }

      return resolvedData
    },
    validateInput: ({ resolvedData, addValidationError, item }) => {
      const state = resolvedData.state || item?.state
      // << 狀態是 transferred 時，不論來自 resolvedData 或 item，必須有 relatedOrder，否則報錯 >>
      const extractRelatedOrderLength = (o?: unknown) => {
        if (!o) return 0
        if (Array.isArray(o)) return o.length
        const oo = o as { connect?: unknown[]; set?: unknown[] }
        if (Array.isArray(oo.connect) && oo.connect.length > 0)
          return oo.connect.length
        if (Array.isArray(oo.set) && oo.set.length > 0) return oo.set.length
        return 0
      }
      if (state === 'transferred') {
        const len1 = extractRelatedOrderLength(resolvedData.relatedOrder)
        const len2 = extractRelatedOrderLength(item?.relatedOrder)
        if (len1 + len2 === 0) {
          addValidationError('狀態為「已轉交」時，必須設定訂單更動')
        }
      }
    },
  },
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
    name: text({
      label: '廣告名稱',
      validation: {
        isRequired: true,
        length: {
          max: 10,
        },
      },
    }),
    nameEditable: checkbox({
      label: '廣告名稱客戶可修改',
      defaultValue: false,
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
    attachment: relationship({
      label: '附件',
      ref: 'Pdf',
    }),
    paragraphOne: text({
      label: '第一段文字',
      ui: {
        displayMode: 'textarea',
      },
    }),
    paragraphOneEditable: checkbox({
      label: '客戶可修改第一段文字',
      defaultValue: false,
    }),
    paragraphTwo: text({
      label: '第二段文字',
      ui: {
        displayMode: 'textarea',
      },
    }),
    paragraphTwoEditable: checkbox({
      label: '客戶可修改第二段文字',
      defaultValue: false,
    }),
    image: relationship({
      label: '圖片素材',
      ref: 'Photo',
    }),
    imageEditable: checkbox({
      label: '客戶可修改圖片',
      defaultValue: false,
    }),
    demoImage: relationship({
      label: '成品樣圖',
      ref: 'Photo',
      many: true,
    }),
    schedule: text({
      label: '排程播出時間',
    }),
    scheduleEditable: checkbox({
      label: '客戶可修改排播日期',
      defaultValue: false,
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
