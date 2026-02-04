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

/**
 * 環境變數轉 Set，並可加入預設值。
 *
 * 範例設定：
 * ACCESS_CONTROL_STRATEGY=restricted
 * ACCESS_CONTROL_RESTRICTED_QUERY_LISTS=User,Post
 * ACCESS_CONTROL_RESTRICTED_UPDATE_DELETE_LISTS=User,SecretList
 */
const parseListEnvToSet = (value: string | undefined, defaults: string[] = []) => {
  const set = new Set(defaults)
  ;(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => set.add(item))
  return set
}

// restricted 預設封鎖 User list（query/update/delete）
const defaultRestrictedLists =
  accessControlStrategy === 'restricted' ? ['User'] : []

const restrictedQueryLists = parseListEnvToSet(
  process.env.ACCESS_CONTROL_RESTRICTED_QUERY_LISTS,
  defaultRestrictedLists
)
const restrictedUpdateDeleteLists = parseListEnvToSet(
  process.env.ACCESS_CONTROL_RESTRICTED_UPDATE_DELETE_LISTS,
  defaultRestrictedLists
)

const bypassWithRestrictions: ListOperationAccessControl<
  AccessOperation,
  BaseListTypeInfo
> = ({ listKey, operation }) => {
  if (!listKey || !operation) return true

  if (operation === 'query' && restrictedQueryLists.has(listKey)) {
    return false
  }

  if (
    (operation === 'update' || operation === 'delete') &&
    restrictedUpdateDeleteLists.has(listKey)
  ) {
    return false
  }

  return true
}

type ACLCheckFunction = (
  auth: BaseAccessArgs<BaseListTypeInfo>
) => MaybePromise<boolean>

type ListACLFunction = (
  ...args: ACLCheckFunction[]
) => ListOperationAccessControl<AccessOperation, BaseListTypeInfo>

// Role configuration
const ROLES = ['admin', 'moderator', 'editor', 'contributor'] as const
// TODO: Add owner when implemented
// const ROLES = ['admin', 'moderator', 'editor', 'contributor', 'owner'] as const

export type Role = (typeof ROLES)[number]

export const allowRoles: ListACLFunction = (...args) => {
  // 此function會返回Boolean到list.access中, true為能夠存取, false則是無存取權
  switch (accessControlStrategy) {
    case 'gql':
    case 'preview': {
      return () => true
    }
    case 'restricted': {
      // 可透過環境變數指定部分 list 的 query/update/delete 禁用
      return bypassWithRestrictions
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
  if (accessControlStrategy === 'restricted') {
    return bypassWithRestrictions
  }

  return async (auth) => {
    const newArgs = [...args, isNeedToTurnOffAccessControl]

    return await checkAccessControl(newArgs, auth)
  }
}

export const allowAllRoles: ListACLFunction = (...additionalRoles) => {
  // Allow all roles defined in ROLES plus any additional roles passed as arguments
  // To add new roles, add them to ROLES above
  const roles = [...allStandardRoles, ...additionalRoles]
  return allowRoles(...roles)
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

// Create a role checker function for a specific role
const createRoleChecker = (role: Role): ACLCheckFunction => {
  return (auth) => {
    // 我們可以在auth.session.data取得當下登入使用者的資料，用此來對比使用者的role
    // 預設auth.session.data只有user.name
    // 若要取得user.role或是其他user資料，可至auth.ts中的sessionData調整
    const user = auth?.session?.data
    return Boolean(user && user.role === role)
  }
}

// Auto-generate role checker functions from ROLES
const roleCheckersMap = ROLES.reduce((acc, role) => {
  acc[role] = createRoleChecker(role)
  return acc
}, {} as Record<Role, ACLCheckFunction>)

// Export individual role checker functions for convenience (backward compatibility)
// Note: When adding new roles, you can use roleCheckers.newRole directly without adding here
// Or add it here if you want direct export: export const { admin, moderator, editor, contributor, newRole } = roleCheckersMap
export const { admin, moderator, editor, contributor } = roleCheckersMap

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

// Role checkers mapping - automatically generated from ROLES
// Export for programmatic access: roleCheckers.admin, roleCheckers.moderator, etc.
export const roleCheckers: Record<Role, ACLCheckFunction> = roleCheckersMap

// All roles array - automatically generated from ROLES
// All roles defined in ROLES are included
const allStandardRoles: ACLCheckFunction[] = ROLES.map(
  (role) => roleCheckers[role]
)
