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
  scheduleConfirmDeadline?: string
  scheduleEndDate?: string
  orderNumber?: string
  state?: string
  member?: {
    id: string
    email?: string
    name?: string
  }
  name?: string
} & BaseItem

const domain = `https://tabris-tv-ad-admin-next-${process.env.ENV}-439405143478.asia-east1.run.app`

const formatDateToMonthDay = (
  date: string | Date | null | undefined,
  showTime = false
): string => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  return `${month}月${day}日${
    showTime ? `，${dateObj.getHours()}:${dateObj.getMinutes()}` : ''
  }`
}

const MEMBER_EMAIL_CONTENT: Record<
  string,
  {
    subject: (data: any) => string
    bodyTitle: (data: any) => string
    body: (data: any) => string | string[]
    afterBody?: (data: any) => string
  }
> = {
  paid: {
    subject: () => '【鏡新聞個人廣告系統】訂單已成立，請上傳素材',
    bodyTitle: () => '新訂單已成立 - 請上傳素材',
    body: (data) => [
      `您的新訂單已成立，請登入鏡新聞個人廣告後台上傳素材。連結如下：${domain}/order/${data.orderNumber}`,
      `上傳素材成功後，您將收到訂單確認信，屆時廣告將開始正式製作。`,
    ],
  },
  video_wip: {
    subject: () => '【鏡新聞個人廣告系統】訂單已確認，廣告影片製作中',
    bodyTitle: () => '影片製作中',
    body: () => '您的廣告影片正在製作中，完成後我們會通知您確認。',
  },
  to_be_confirmed: {
    subject: () => '【鏡新聞個人廣告系統】請確認影片預覽內容和排播時間',
    bodyTitle: () => '請確認影片預覽內容和排播時間',
    body: (data) =>
      `您的廣告影片已製作完成，請確認影片預覽內容和排播時間。連結如下：${domain}/order/${data.orderNumber}`,
    afterBody: (data) =>
      `請最晚在 ${formatDateToMonthDay(
        data.scheduleConfirmDeadline,
        true
      )} 前完成確認，若逾時未確認，廣告將不會播出，您需重新申請新的排播時間。`,
  },
  scheduled: {
    subject: () => '【鏡新聞個人廣告系統】廣告排播時間已確認，將安排播出',
    bodyTitle: () => '廣告排播時間已確認',
    body: () => '此訂單已確認，會在預定排播日期播出。',
  },
  broadcasted: {
    subject: () => '【鏡新聞個人廣告系統】訂單已完成，廣告撥出完畢',
    bodyTitle: () => '訂單已完成-廣告播出完畢',
    body: (data) =>
      `此筆訂單已完成，感謝您的支持！廣告已於 ${formatDateToMonthDay(
        data.broadcastDate
      )} 播放完畢。`,
  },
  // modification_request: {
  //   subject: () => '【鏡新聞個人廣告系統】訂單修改請求已送出',
  //   bodyTitle: () => '訂單已提出修改需求',
  //   body: () => '您的修改需求已提出，業務將會審核需求後直接回覆。',
  // },
  pending_broadcast_date: {
    subject: () =>
      '【鏡新聞個人廣告系統】廣告排播時間逾時未確認，請重新設定排播時間',
    bodyTitle: () => '請確認影片預覽內容和排播時間',
    body: (data) =>
      `您的廣告影片已製作完成，請確認影片預覽內容，並重新設定排播時間。連結如下：${domain}/order/${data.orderNumber}`,
  },
  // transferred: {
  //   subject: (data) =>
  //     `【鏡新聞個人廣告系統】訂單 ${data.orderNumber} 已經轉移至新訂單 ${data.relatedOrderNumber}`,
  //   bodyTitle: (data) =>
  //     `訂單 ${data.orderNumber} 已經轉移至新訂單 ${data.relatedOrderNumber}`,
  //   body: (data) =>
  //     `您的訂單修改需求系統已收到，新訂單編號：${data.relatedOrderNumber}。`,
  // },
  cancelled: {
    subject: () => `【鏡新聞個人廣告系統】您的訂單已取消`,
    bodyTitle: (data) => `您的 訂單 ${data.orderNumber} 已取消`,
    body: () => '您的訂單已取消。',
  },
}

const SALES_EMAIL_CONTENT: Record<
  string,
  {
    subject: string | ((data: any) => string)
    body: (data: any) => string
  }
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
    subject: '用戶已確認訂單影片內容',
    body: () => '用戶已確認訂單內容，請盡快安排播放。',
  },
  // modification_request: {
  //   subject: '用戶已提出修改需求',
  //   body: () => '用戶針對一筆訂單提出修改需求，請盡快至CMS更改訂單狀態。',
  // },
  date_reset: {
    subject: '用戶已重新設定排播時間',
    body: () => '用戶針對一筆訂單重新設定排播時間，請盡快至CMS更改訂單狀態。',
  },
  // transferred: {
  //   subject: (data) =>
  //     `訂單 ${data.orderNumber} 已轉移至新訂單 ${data.relatedOrderNumber}`,
  //   body: () => '用戶已完成需修改素材上傳，請盡快至CMS確認素材。',
  // },
  cancelled: {
    subject: '訂單已取消',
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
    scheduleConfirmDeadline?: string
    broadcastDate?: string
  }
) {
  if (!data.newState || !MEMBER_EMAIL_CONTENT[data.newState]) {
    return
  }

  const emailContent = MEMBER_EMAIL_CONTENT[data.newState]
  const subject = emailContent.subject(data)
  const body = emailContent.body(data)
  const afterBody = emailContent.afterBody ? emailContent.afterBody(data) : ''

  const emailPayload = {
    receiver: [data.memberEmail],
    subject: `${subject}${
      data.newState === 'transferred' ? '' : ' - ' + data.orderNumber
    }`,
    body: `
      <h2>${subject}</h2>
      <p>親愛的 ${data.memberName || '客戶'}，您好：</p>
      <p>${typeof body === 'string' ? body : body.join('<br/>')}</p>
      <ul>
        <li><strong>訂單編號：</strong>${data.orderNumber}</li>
        <li><strong>廣告名稱：</strong>${data.orderName}</li>
      </ul>
      ${afterBody ? `<p>${afterBody}</p>` : ''}
      <p>此為系統自動通知信件，請勿回覆此郵件，如需要聯繫客服，請寫信至 mnews_sales@mnews.tw</p>
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
  const subject =
    typeof emailContent.subject === 'function'
      ? emailContent.subject(data)
      : emailContent.subject
  const body = emailContent.body(data)
  // const subjectText =
  //   typeof emailContent.subject === 'function'
  //     ? emailContent.subject(data)
  //     : emailContent.subject

  const emailPayload = {
    receiver: [salesEmail],
    subject: `${subject}${
      data.newState === 'transferred' ? '' : ' - ' + data.orderNumber
    }`,
    body: `
      <h2>${subject}</h2>
      <p>您好，</p>
      <p>${body}</p>
      <ul>
        <li><strong>訂單編號：</strong>${data.orderNumber}</li>
        <li><strong>廣告名稱：</strong>${data.orderName}</li>
        <li><strong>會員：</strong>${data.memberName || '未指定'}</li>
      </ul>
      <p>此為系統自動通知信件，請勿回覆此郵件。</p>
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
            'id orderNumber name scheduleConfirmDeadline scheduleEndDate member { id email name }',
        })
      } catch (error) {
        console.error('Error fetching order data:', error)
        return
      }

      const memberEmail = orderData?.member?.email
      const memberName = orderData?.member?.name

      let relatedOrderNumber
      if (currentItem.state === 'transferred') {
        try {
          const childOrders = await context.query.Order.findMany({
            where: {
              parentOrder: { id: { equals: currentItem.id } },
            },
            query: 'id orderNumber',
            take: 1,
          })
          relatedOrderNumber = childOrders?.[0]?.orderNumber
        } catch (error) {
          console.error('Error fetching child order:', error)
        }
      }

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
          scheduleConfirmDeadline: orderData.scheduleConfirmDeadline,
          broadcastDate: orderData.scheduleEndDate,
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
