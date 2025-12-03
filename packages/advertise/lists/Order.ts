import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import {
  text,
  select,
  relationship,
  checkbox,
  timestamp,
  integer,
} from '@keystone-6/core/fields'
import { sendEmailOnStateChange } from '../utils/send-email-on-state-change'
import envVar from '../environment-variables'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const orderStateOptions = [
  { label: '待上傳素材', value: 'paid' },
  { label: '已上傳檔案', value: 'file_uploaded' },
  { label: '影片製作中', value: 'video_wip' },
  { label: '待確認', value: 'to_be_confirmed' },
  { label: '待排播', value: 'scheduled' },
  { label: '已播出', value: 'broadcasted' },
  { label: '提出修改要求', value: 'modification_request' },
  { label: '待加購修改', value: 'pending_quote_confirmation' },
  { label: '待設定排播日期', value: 'pending_broadcast_date' },
  { label: '已重新設定排播日期', value: 'date_reset' },
  { label: '已轉移至新訂單', value: 'transferred' },
  { label: '已作廢', value: 'cancelled' },
]

const listConfigurations = list({
  hooks: {
    resolveInput: ({ resolvedData, operation, item }) => {
      if (operation === 'create' && !item && !resolvedData.updatedAt) {
        resolvedData.updatedAt = new Date()
      }

      const price = resolvedData.price ?? item?.price ?? 0

      if (price === 400 || price === 600) {
        resolvedData.needsModification = true
        resolvedData.isReviewed = false
      } else if (price === 1400 || price === 1600) {
        resolvedData.needsModification = true
        resolvedData.isUrgent = true
        resolvedData.isReviewed = false
      }

      const state = resolvedData.state ?? item?.state
      if (state === 'scheduled') {
        resolvedData.isReviewed = true
      }

      return resolvedData
    },
    afterOperation: async ({ operation, item, context, originalItem }) => {
      if (operation !== 'create' && operation !== 'update') return

      const parentOrderChanged =
        operation === 'create'
          ? item.parentOrderId
          : originalItem?.parentOrderId !== item.parentOrderId

      if (parentOrderChanged && item.parentOrderId) {
        await context.prisma.order.update({
          where: { id: Number(item.parentOrderId) },
          data: {
            state: 'transferred',
          },
        })
      }
    },
    validateInput: async ({
      resolvedData,
      addValidationError,
      item,
      context,
    }) => {
      const state = resolvedData.state || item?.state

      if (resolvedData.parentOrder?.disconnect) {
        addValidationError('不能取消已設定的母訂單')
        return
      }

      if (resolvedData.parentOrder?.connect) {
        const parentOrderId =
          resolvedData.parentOrder.connect.id ||
          resolvedData.parentOrder.connect

        if (parentOrderId && item?.id && parentOrderId === item.id) {
          addValidationError('不能選擇自己作為母訂單')
          return
        }

        if (item?.parentOrderId) {
          addValidationError('此訂單已經設定過母訂單，不能再次修改')
          return
        }

        if (item?.state === 'transferred') {
          addValidationError('已轉移至新訂單的訂單不能再設定母訂單')
          return
        }

        if (parentOrderId) {
          const targetOrder = await context.query.Order.findOne({
            where: { id: parentOrderId },
            query: 'id state',
          })

          if (!targetOrder) {
            addValidationError('目標訂單不存在')
            return
          }
        }
      }

      if (state === 'to_be_confirmed') {
        const demoImage = resolvedData.demoImage ?? item?.demoImageId
        const attachment = resolvedData.attachment ?? item?.attachmentId
        const scheduleConfirmDeadline =
          resolvedData.scheduleConfirmDeadline ?? item?.scheduleConfirmDeadline

        const missingFields: string[] = []

        if (!demoImage) {
          missingFields.push('影片截圖')
        }
        if (!attachment) {
          missingFields.push('相關文件')
        }
        if (!scheduleConfirmDeadline) {
          missingFields.push('使用者確認截止日期')
        }

        if (missingFields.length > 0) {
          addValidationError(
            `狀態為「待確認」時，必須填寫以下欄位：${missingFields.join('、')}`
          )
        }
      }

      const scheduleConfirmDeadline =
        resolvedData.scheduleConfirmDeadline ?? item?.scheduleConfirmDeadline
      const scheduleStartDate =
        resolvedData.scheduleStartDate ?? item?.scheduleStartDate

      if (scheduleConfirmDeadline && scheduleStartDate) {
        const deadline = new Date(scheduleConfirmDeadline)
        const startDate = new Date(scheduleStartDate)

        if (deadline > startDate) {
          addValidationError('確認截止日期晚於排播開始日期')
        }
      }
    },
  },
  fields: {
    member: relationship({
      label: '會員',
      ref: 'Member.orders',
      ui: {
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    orderNumber: text({
      label: '訂單編號',
      validation: {
        isRequired: true,
      },
      isIndexed: 'unique',
      ui: {
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    name: text({
      label: '廣告名稱',
      validation: {
        isRequired: true,
      },
    }),
    price: integer({
      label: '訂單價格',
      defaultValue: 0,
      ui: {
        itemView: {
          fieldMode: 'read',
        },
      },
      validation: {
        isRequired: false,
      },
    }),
    state: select({
      label: '狀態',
      options: orderStateOptions,
      defaultValue: 'paid',
    }),
    isUrgent: checkbox({
      label: '急件',
      defaultValue: false,
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    needsModification: checkbox({
      label: '此為修改訂單',
      defaultValue: false,
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    isReviewed: checkbox({
      label: '客戶是否已確認過影片預覽',
      defaultValue: false,
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    parentOrder: relationship({
      label: '母訂單',
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
    campaignPeriod: integer({
      label: '廣告走期',
      defaultValue: 0,
      validation: {
        isRequired: true,
      },
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
    scheduleConfirmDeadline: timestamp({
      label: '使用者確認截止日期',
      db: {
        isNullable: true,
      },
      validation: {
        isRequired: false,
      },
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

export default utils.addTrackingFields(
  sendEmailOnStateChange(
    listConfigurations,
    envVar.emailApiUrl,
    envVar.advertiseSalesEmail
  )
)
