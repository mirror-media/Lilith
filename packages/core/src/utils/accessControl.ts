import type {
  BaseAccessArgs,
  AccessOperation,
} from '@keystone-6/core/dist/declarations/src/types/config/access-control'
import type {
  BaseListTypeInfo,
  ListOperationAccessControl,
  MaybePromise,
} from '@keystone-6/core/types'

const accessControlStrategy = process.env.ACCESS_CONTROL_STRATEGY

type ACLCheckFunction = (
  auth: BaseAccessArgs<BaseListTypeInfo>
) => MaybePromise<boolean>

type ListACLFunction = (
  ...args: ACLCheckFunction[]
) => ListOperationAccessControl<AccessOperation, BaseListTypeInfo>

export const allowRoles: ListACLFunction = (...args) => {
  // 此function會返回Boolean到list.access中, true為能夠存取, false則是無存取權
  switch (accessControlStrategy) {
    case 'gql':
    case 'preview': {
      return () => true
    }
    case 'cms':
    default: {
      return async (auth) => {
        return await checkAccessControl(args, auth)
      }
    }
  }
}

export const allowRolesForUsers: ListACLFunction = (...args) => {
  // keystone若是發現user在db中沒有任何資料，會貼心地引導我們創立一個新的user
  // 然而，此CMS預設user會有access control（安全型考量）
  // 若user的create access control受到限制,則adminUI將會沒有權限幫我們新增
  // （陷入沒辦法登入進CMS的窘境）
  // 因此在user的access control需要多判斷「如果db中沒有user存在，就暫時關閉access control用以新增user」
  return async (auth) => {
    const newArgs = [...args, isNeedToTurnOffAccessControl]

    return await checkAccessControl(newArgs, auth)
  }
}

const isNeedToTurnOffAccessControl: ACLCheckFunction = async (auth) => {
  // if no users in db, then turn off access-control for creating first user
  const users = await auth.context.prisma.user.findMany()

  return users.length === 0
}

async function checkAccessControl(
  checkFunctionArray: ACLCheckFunction[],
  auth: BaseAccessArgs<BaseListTypeInfo>
) {
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

export const admin: ACLCheckFunction = (auth) => {
  // 我們可以在auth.session.data取得當下登入使用者的資料，用此來對比使用者的role
  // 預設auth.session.data只有user.name
  // 若要取得user.role或是其他user資料，可至auth.ts中的sessionData調整
  const user = auth?.session?.data
  return Boolean(user && user.role === 'admin')
}

export const moderator: ACLCheckFunction = (auth) => {
  const user = auth?.session?.data
  return Boolean(user && user.role === 'moderator')
}

export const editor: ACLCheckFunction = (auth) => {
  const user = auth?.session?.data
  return Boolean(user && user.role === 'editor')
}

export const contributor: ACLCheckFunction = (auth) => {
  const user = auth?.session?.data
  return Boolean(user && user.role === 'contributor')
}

// TODO: 完成owner
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const owner: ACLCheckFunction = async (auth) => {
  //   const user = auth?.session?.data
  //   if (!user) return false
  //   console.log(auth.content)

  //   // const editedList =  await auth.context.prisma[auth.listKey].find()

  //   return Boolean(user && user.role === 'owner')

  return false
}
