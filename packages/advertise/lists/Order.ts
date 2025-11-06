import { list, graphql } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import {
  text,
  select,
  relationship,
  checkbox,
  timestamp,
  integer,
  virtual,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const MODIFICATION_PRICE_TABLE = {
  nameEditable: 100,
  paragraphOneEditable: 200,
  paragraphTwoEditable: 200,
  imageEditable: 300,
  scheduleEditable: 150,
}

const orderStateOptions = [
  { label: '待上傳素材', value: 'paid' },
  { label: '已上傳檔案', value: 'file_uploaded' },
  { label: '影片製作中', value: 'video_wip' },
  { label: '待確認', value: 'to_be_confirmed' },
  { label: '待排播', value: 'scheduled' },
  { label: '已播出', value: 'broadcasted' },
  { label: '提出修改要求', value: 'modification_request' },
  { label: '待確認修改報價', value: 'pending_quote_confirmation' },
  { label: '待設定排播日期', value: 'pending_broadcast_date' },
  { label: '已重新設定排播日期', value: 'date_reset' },
  { label: '已轉移至新訂單', value: 'transferred' },
  { label: '已作廢', value: 'cancelled' },
]

const extractRelatedOrderLength = (o?: unknown) => {
  if (!o) return 0
  if (Array.isArray(o)) return o.length
  const oo = o as { connect?: unknown[]; set?: unknown[] }
  if (Array.isArray(oo.connect) && oo.connect.length > 0)
    return oo.connect.length
  if (Array.isArray(oo.set) && oo.set.length > 0) return oo.set.length
  return 0
}

const listConfigurations = list({
  hooks: {
    resolveInput: ({ resolvedData, operation, item }) => {
      if (operation === 'create' && !item && !resolvedData.updatedAt) {
        resolvedData.updatedAt = new Date()
      }

      if (
        extractRelatedOrderLength(resolvedData.relatedOrder) > 0 ||
        extractRelatedOrderLength(item?.relatedOrder) > 0
      ) {
        resolvedData.state = 'transferred'
      }

      return resolvedData
    },
    validateInput: async ({
      resolvedData,
      addValidationError,
      item,
      context,
    }) => {
      const state = resolvedData.state || item?.state

      if (resolvedData.relatedOrder) {
        const relatedOrderId =
          resolvedData.relatedOrder.connect?.id ||
          resolvedData.relatedOrder.connect

        if (relatedOrderId && item?.id && relatedOrderId === item.id) {
          addValidationError('不能選擇自己作為訂單更動的目標')
          return
        }

        if (item?.relatedOrder && relatedOrderId) {
          addValidationError('此訂單已經轉移過，不能再次修改轉移目標')
          return
        }

        if (relatedOrderId) {
          const targetOrder = await context.query.Order.findOne({
            where: { id: relatedOrderId },
            query: 'id state relatedOrder { id }',
          })

          if (!targetOrder) {
            addValidationError('目標訂單不存在')
            return
          }

          if (targetOrder.relatedOrder) {
            addValidationError('不能選擇已經轉移出去的訂單作為訂單更動的目標')
            return
          }

          const ordersPointingToTarget = await context.query.Order.findMany({
            where: {
              relatedOrder: { id: { equals: relatedOrderId } },
            },
            query: 'id',
          })

          if (ordersPointingToTarget && ordersPointingToTarget.length > 0) {
            addValidationError(
              '此訂單已經被其他訂單轉移過來，不能再次被選為目標'
            )
            return
          }
        }
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
      ui: {
        hideCreate: true,
        displayMode: 'select',
      },
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
    videoDuration: integer({
      label: '廣告時長（秒）',
      defaultValue: 0,
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
      validation: {
        isRequired: false,
      },
    }),
    demoImage: relationship({
      label: '影片截圖',
      ref: 'Photo',
    }),
    attachment: relationship({
      label: '相關文件',
      ref: 'Pdf',
    }),
    scheduleStartDate: timestamp({
      label: '排播開始日期',
      db: {
        isNullable: true,
      },
      validation: {
        isRequired: false,
      },
    }),
    scheduleEndDate: timestamp({
      label: '排播結束日期',
      db: {
        isNullable: true,
      },
      validation: {
        isRequired: false,
      },
    }),
    scheduleEditable: checkbox({
      label: '客戶可修改排播日期',
      defaultValue: false,
    }),
    scheduleConfirmDeadline: timestamp({
      label: '使用者確認截止日期',
      db: {
        isNullable: true,
      },
      validation: {
        isRequired: false,
      },
    }),
    price: integer({
      label: '此筆訂單價格',
      defaultValue: 0,
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
      validation: {
        isRequired: false,
      },
    }),
    modificationPrice: virtual({
      label: '根據可修改欄位需要的修改金額',
      field: graphql.field({
        type: graphql.Int,
        resolve(item) {
          let total = 0
          if (item.nameEditable) {
            total += MODIFICATION_PRICE_TABLE.nameEditable
          }
          if (item.paragraphOneEditable) {
            total += MODIFICATION_PRICE_TABLE.paragraphOneEditable
          }
          if (item.paragraphTwoEditable) {
            total += MODIFICATION_PRICE_TABLE.paragraphTwoEditable
          }
          if (item.imageEditable) {
            total += MODIFICATION_PRICE_TABLE.imageEditable
          }
          if (item.scheduleEditable) {
            total += MODIFICATION_PRICE_TABLE.scheduleEditable
          }
          return total
        },
      }),
    }),
  },

  ui: {
    listView: {
      initialColumns: [
        'member',
        'orderNumber',
        'state',
        'scheduleStartDate',
        'scheduleEndDate',
      ],
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
