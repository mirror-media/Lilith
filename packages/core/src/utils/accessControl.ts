const accessControlStrategy = process.env.ACCESS_CONTROL_STRATEGY

export const allowRoles = (...args: any[]) => {
  // 此function會返回Boolean到list.access中, true為能夠存取, false則是無存取權
  switch (accessControlStrategy) {
    case 'gql':
    case 'preview': {
      return () => true
    }
    case 'cms':
    default: {
      return async (auth: any) => {
        return await checkAccessControl(args, auth)
      }
    }
  }
}

export const allowRolesForUsers = (...args: any[]) => {
  // keystone若是發現user在db中沒有任何資料，會貼心地引導我們創立一個新的user
  // 然而，此CMS預設user會有access control（安全型考量）
  // 若user的create access control受到限制,則adminUI將會沒有權限幫我們新增
  // （陷入沒辦法登入進CMS的窘境）
  // 因此在user的access control需要多判斷「如果db中沒有user存在，就暫時關閉access control用以新增user」
  return async (auth: any) => {
    const newArgs = [...args, isNeedToTurnOffAccessControl]

    return await checkAccessControl(newArgs, auth)
  }
}

async function isNeedToTurnOffAccessControl(auth: any) {
  // if no users in db, then turn off access-control for creating first user
  const users = await auth.context.prisma.user.findMany()

  return users.length === 0
}

async function checkAccessControl(checkFunctionArray: any[], auth: any) {
  let accessControlResult = false
  for (let i = 0; i < checkFunctionArray.length; i++) {
    // check是被傳入的role判斷function，admin、moderator、editor等等的
    // check()將會取得決定此user能否有存取權的boolean值
    const check = checkFunctionArray[i]
    const checkResult = await check(auth)

    if (checkResult) {
      accessControlResult = checkResult
      break
    }
  }

  return accessControlResult
}

export const admin = (auth: any) => {
  // 我們可以在auth.session.data取得當下登入使用者的資料，用此來對比使用者的role
  // 預設auth.session.data只有user.name
  // 若要取得user.role或是其他user資料，可至auth.ts中的sessionData調整
  const user = auth?.session?.data
  return Boolean(user && user.role === 'admin')
}

export const moderator = (auth: any) => {
  const user = auth?.session?.data
  return Boolean(user && user.role === 'moderator')
}

export const editor = (auth: any) => {
  const user = auth?.session?.data
  return Boolean(user && user.role === 'editor')
}

export const contributor = (auth: any) => {
  const user = auth?.session?.data
  return Boolean(user && user.role === 'contributor')
}

// TODO: 完成owner
export const owner = async (auth: any) => { // eslint-disable-line
  //   const user = auth?.session?.data
  //   if (!user) return false
  //   console.log(auth.content)

  //   // const editedList =  await auth.context.prisma[auth.listKey].find()

  //   return Boolean(user && user.role === 'owner')

  return false
}
