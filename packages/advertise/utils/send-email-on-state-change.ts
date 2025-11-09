import type { ListConfig } from '@keystone-6/core'
import type {
  BaseFields,
  BaseItem,
  BaseListTypeInfo,
  ListHooks,
} from '@keystone-6/core/types'
import { GoogleAuth } from 'google-auth-library'

type AfterOperationHook = ListHooks<BaseListTypeInfo>['afterOperation']

type OrderItem = {
  id: string
  orderNumber?: string
  state?: string
  member?: {
    id: string
    email?: string
    name?: string
  }
  name?: string
} & BaseItem

const STATE_LABELS: Record<string, string> = {
  paid: '待上傳素材',
  file_uploaded: '已上傳檔案',
  video_wip: '影片製作中',
  to_be_confirmed: '待確認',
  scheduled: '待排播',
  broadcasted: '已播出',
  modification_request: '提出修改要求',
  pending_quote_confirmation: '待確認修改報價',
  pending_broadcast_date: '待設定排播日期',
  date_reset: '已重新設定排播日期',
  transferred: '已轉移至新訂單',
  cancelled: '已作廢',
}

async function sendEmail(
  emailApiUrl: string,
  emailPayload: {
    receiver: string[]
    subject: string
    body: string
  },
  recipientType: string
) {
  try {
    const auth = new GoogleAuth()
    const client = await auth.getIdTokenClient(emailApiUrl)

    await client.request({
      url: emailApiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: emailPayload,
      timeout: 10000,
    })
  } catch (error) {
    console.error(`Error sending email to ${recipientType}:`, {
      error: error instanceof Error ? error.message : String(error),
      receiver: emailPayload.receiver,
    })
  }
}

async function sendEmailToMember(
  emailApiUrl: string,
  data: {
    orderId: string
    orderNumber?: string
    previousState?: string
    newState?: string
    memberEmail: string
    memberName?: string
    orderName?: string
  }
) {
  const previousStateLabel = data.previousState
    ? STATE_LABELS[data.previousState] || data.previousState
    : '未知'
  const newStateLabel = data.newState
    ? STATE_LABELS[data.newState] || data.newState
    : '未知'

  const emailPayload = {
    receiver: [data.memberEmail],
    subject: `鏡電視廣告訂單狀態更新 - ${data.orderNumber}`,
    body: `
      <h2>訂單狀態更新通知</h2>
      <p>親愛的 ${data.memberName || '客戶'}，您好：</p>
      <p>您的訂單狀態已更新</p>
      <ul>
        <li><strong>訂單編號：</strong>${data.orderNumber}</li>
        <li><strong>廣告名稱：</strong>${data.orderName}</li>
        <li><strong>原狀態：</strong>${previousStateLabel}</li>
        <li><strong>新狀態：</strong>${newStateLabel}</li>
      </ul>
      <p>如有任何疑問，請與我們聯繫。</p>
      <br>
      <p>鏡電視廣告團隊</p>
    `,
  }

  return sendEmail(emailApiUrl, emailPayload, '會員')
}

async function sendEmailToSales(
  emailApiUrl: string,
  data: {
    orderId: string
    orderNumber?: string
    previousState?: string
    newState?: string
    salesEmail: string
    salesName?: string
    memberName?: string
    orderName?: string
  }
) {
  const previousStateLabel = data.previousState
    ? STATE_LABELS[data.previousState] || data.previousState
    : '未知'
  const newStateLabel = data.newState
    ? STATE_LABELS[data.newState] || data.newState
    : '未知'

  const emailPayload = {
    receiver: [data.salesEmail],
    subject: `訂單狀態更新通知 - ${data.orderNumber}`,
    body: `
      <h2>訂單狀態更新通知</h2>
      <p>${data.salesName || '您好'}，</p>
      <p>您負責的訂單狀態已更新：</p>
      <ul>
        <li><strong>訂單編號：</strong>${data.orderNumber}</li>
        <li><strong>廣告名稱：</strong>${data.orderName}</li>
        <li><strong>會員：</strong>${data.memberName || '未指定'}</li>
        <li><strong>原狀態：</strong>${previousStateLabel}</li>
        <li><strong>新狀態：</strong>${newStateLabel}</li>
      </ul>
      <p>此為系統自動通知信件。</p>
      <br>
      <p>鏡電視廣告系統</p>
    `,
  }

  return sendEmail(emailApiUrl, emailPayload, '業務')
}

function combineAfterOperationHooks<T extends AfterOperationHook>(
  ...hooks: T[]
) {
  return async (params: Parameters<NonNullable<T>>[0]) => {
    await Promise.allSettled(
      hooks
        .filter((hook): hook is NonNullable<T> => typeof hook === 'function')
        .map((hook) => hook(params))
    )
  }
}

export function sendEmailOnStateChange(
  list: ListConfig<BaseListTypeInfo, BaseFields<BaseListTypeInfo>>,
  emailApiUrl: string | undefined
) {
  if (!emailApiUrl) {
    console.error(
      'EMAIL_API_URL is not configured, email notifications will be disabled'
    )
    return list
  }

  const originalAfterOperation = list.hooks?.afterOperation

  const newAfterOperation: AfterOperationHook = async ({
    operation,
    item,
    originalItem,
    context,
  }) => {
    if (operation !== 'update') {
      return
    }

    const currentItem = item as OrderItem | undefined
    const previousItem = originalItem as OrderItem | undefined

    if (
      currentItem?.state &&
      previousItem?.state &&
      currentItem.state !== previousItem.state
    ) {
      let orderWithMember
      try {
        orderWithMember = await context.query.Order.findOne({
          where: { id: currentItem.id },
          query:
            'id orderNumber name member { id email name } sales { id email name }',
        })
      } catch (error) {
        console.error('Error fetching order with member:', error)
        return
      }

      const memberEmail = orderWithMember?.member?.email
      const memberName = orderWithMember?.member?.name

      const salesEmail = orderWithMember?.sales?.email
      const salesName = orderWithMember?.sales?.name

      if (orderWithMember?.member && memberEmail) {
        sendEmailToMember(emailApiUrl, {
          orderId: currentItem.id,
          orderNumber: currentItem.orderNumber,
          previousState: previousItem.state,
          newState: currentItem.state,
          memberEmail,
          memberName,
          orderName: currentItem.name,
        }).catch((error) => {
          console.log('Unhandled error sending email to member:', error)
        })
      } else {
        console.log('Skipping email to member - no member or email:', {
          orderId: currentItem.id,
          hasMember: !!orderWithMember?.member,
          hasEmail: !!memberEmail,
        })
      }

      if (salesEmail) {
        sendEmailToSales(emailApiUrl, {
          orderId: currentItem.id,
          orderNumber: currentItem.orderNumber,
          previousState: previousItem.state,
          newState: currentItem.state,
          salesEmail,
          salesName,
          memberName,
          orderName: currentItem.name,
        }).catch((error) => {
          console.log('Unhandled error sending email to sales:', error)
        })
      } else {
        console.log('Skipping email to sales - no sales assigned to this order')
      }
    }
  }

  list.hooks = {
    ...list.hooks,
    afterOperation: combineAfterOperationHooks(
      originalAfterOperation,
      newAfterOperation
    ),
  }

  return list
}
