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

const MEMBER_EMAIL_CONTENT: Record<
  string,
  { subject: string; body: (data: any) => string }
> = {
  paid: {
    subject: '訂單已成立，請上傳素材',
    body: () =>
      '您的訂單已成立，請至平台上傳廣告素材，以便我們開始製作您的廣告影片。',
  },
  video_wip: {
    subject: '影片製作中',
    body: () => '您的廣告影片正在製作中，完成後我們會通知您確認。',
  },
  to_be_confirmed: {
    subject: '請確認影片預覽內容和排播時間',
    body: () => '您的廣告影片已製作完成，請確認影片預覽內容和排播時間。',
  },
  scheduled: {
    subject: '訂單已確認',
    body: () => '此訂單已確認，會在預定排播日期播出。',
  },
  broadcasted: {
    subject: '訂單已完成',
    body: () => '此筆訂單已完成，感謝您的支持！',
  },
  modification_request: {
    subject: '修改需求已提出',
    body: () => '已提出修改需求，業務會直接透過郵件與您聯繫。',
  },
  pending_quote_confirmation: {
    subject: '待加購修改',
    body: () =>
      '關於此次修改需要額外費用，請至應援平台購買對應商品後重新上傳素材。業務將透過郵件告知詳細金額與購買項目。',
  },
  pending_broadcast_date: {
    subject: '請重新設定排播日期',
    body: (data) => `請重新設定訂單 ${data.orderNumber} 的排播時間。`,
  },
  transferred: {
    subject: '訂單已轉移',
    body: (data) =>
      data.relatedOrderNumber
        ? `舊的訂單 ${data.orderNumber} 已經轉移至新訂單 ${data.relatedOrderNumber}，請查看新訂單資訊。`
        : '舊的訂單已經轉移至新訂單，請查看新訂單資訊。',
  },
  cancelled: {
    subject: '訂單已作廢',
    body: () => '此訂單已作廢/取消。',
  },
}

const SALES_EMAIL_CONTENT: Record<
  string,
  { subject: string; body: (data: any) => string }
> = {
  paid: {
    subject: '新訂單已成立',
    body: () => '新訂單已成立，等待用戶上傳素材。',
  },
  file_uploaded: {
    subject: '用戶已上傳素材',
    body: () => '用戶已在訂單上完成檔案上傳，請查看並開始處理。',
  },
  scheduled: {
    subject: '用戶已確認訂單',
    body: () => '用戶已確認訂單內容，請盡快安排播放。',
  },
  modification_request: {
    subject: '用戶提出修改需求',
    body: () => '用戶提出修改需求，請盡快查看需求並與用戶聯繫。',
  },
  date_reset: {
    subject: '用戶重新設定排播日期',
    body: () => '用戶重新選好時間，需要重新排播給用戶確認。',
  },
  transferred: {
    subject: '用戶已完成訂單轉移',
    body: () => '用戶已完成訂單關聯，重新上傳了需要修改的素材。',
  },
  cancelled: {
    subject: '訂單已作廢',
    body: () => '此訂單已作廢/取消。',
  },
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
    relatedOrderNumber?: string
  }
) {
  if (!data.newState || !MEMBER_EMAIL_CONTENT[data.newState]) {
    return
  }

  const emailContent = MEMBER_EMAIL_CONTENT[data.newState]
  const body = emailContent.body(data)

  const emailPayload = {
    receiver: [data.memberEmail],
    subject: `${emailContent.subject} - ${data.orderNumber}`,
    body: `
      <h2>${emailContent.subject}</h2>
      <p>親愛的 ${data.memberName || '客戶'}，您好：</p>
      <p>${body}</p>
      <ul>
        <li><strong>訂單編號：</strong>${data.orderNumber}</li>
        <li><strong>廣告名稱：</strong>${data.orderName}</li>
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
  salesEmail: string,
  data: {
    orderId: string
    orderNumber?: string
    previousState?: string
    newState?: string
    memberName?: string
    orderName?: string
  }
) {
  if (!data.newState || !SALES_EMAIL_CONTENT[data.newState]) {
    return
  }

  const emailContent = SALES_EMAIL_CONTENT[data.newState]
  const body = emailContent.body(data)

  const emailPayload = {
    receiver: [salesEmail],
    subject: `${emailContent.subject} - ${data.orderNumber}`,
    body: `
      <h2>${emailContent.subject}</h2>
      <p>您好，</p>
      <p>${body}</p>
      <ul>
        <li><strong>訂單編號：</strong>${data.orderNumber}</li>
        <li><strong>廣告名稱：</strong>${data.orderName}</li>
        <li><strong>會員：</strong>${data.memberName || '未指定'}</li>
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
  emailApiUrl: string | undefined,
  salesEmail: string | undefined
) {
  if (!emailApiUrl) {
    console.error(
      'EMAIL_API_URL is not configured, email notifications will be disabled'
    )
    return list
  }

  if (!salesEmail) {
    console.error(
      'ADVERTISE_SALES_EMAIL is not configured, sales email notifications will be disabled'
    )
  }

  const originalAfterOperation = list.hooks?.afterOperation

  const newAfterOperation: AfterOperationHook = async ({
    operation,
    item,
    originalItem,
    context,
  }) => {
    if (operation !== 'update' && operation !== 'create') {
      return
    }

    const currentItem = item as OrderItem | undefined
    const previousItem = originalItem as OrderItem | undefined

    // For create operation, send email if the initial state is 'paid'
    // For update operation, send email if the state has changed
    const shouldSendEmail =
      (operation === 'create' && currentItem?.state === 'paid') ||
      (operation === 'update' &&
        currentItem?.state &&
        previousItem?.state &&
        currentItem.state !== previousItem.state)

    if (shouldSendEmail) {
      let orderData
      try {
        orderData = await context.query.Order.findOne({
          where: { id: currentItem.id },
          query:
            'id orderNumber name member { id email name } relatedOrder { id orderNumber }',
        })
      } catch (error) {
        console.error('Error fetching order data:', error)
        return
      }

      const memberEmail = orderData?.member?.email
      const memberName = orderData?.member?.name
      const relatedOrderNumber = orderData?.relatedOrder?.orderNumber

      if (orderData?.member && memberEmail) {
        sendEmailToMember(emailApiUrl, {
          orderId: currentItem.id,
          orderNumber: currentItem.orderNumber,
          previousState: previousItem?.state,
          newState: currentItem.state,
          memberEmail,
          memberName,
          orderName: currentItem.name,
          relatedOrderNumber,
        }).catch((error) => {
          console.log('Unhandled error sending email to member:', error)
        })
      } else {
        console.log('Skipping email to member - no member or email:', {
          orderId: currentItem.id,
          hasMember: !!orderData?.member,
          hasEmail: !!memberEmail,
        })
      }

      if (salesEmail) {
        sendEmailToSales(emailApiUrl, salesEmail, {
          orderId: currentItem.id,
          orderNumber: currentItem.orderNumber,
          previousState: previousItem?.state,
          newState: currentItem.state,
          memberName,
          orderName: currentItem.name,
        }).catch((error) => {
          console.log('Unhandled error sending email to sales:', error)
        })
      } else {
        console.log('Skipping email to sales - no sales email configured')
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
