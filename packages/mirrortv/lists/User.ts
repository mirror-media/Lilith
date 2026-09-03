import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, password, select, checkbox } from '@keystone-6/core/fields'
import { reporter } from '../utils/access-control'
const {
  allowRolesForUsers,
  allowAllRoles,
  admin,
  moderator,
  editor,
  contributor,
} = utils.accessControl

// Self-service password change (Asana 1217892227794539), mirroring the
// mirrormedia User.ts "default-deny" design:
//   - operation.update: widened to the self-service roles. allowRolesForUsers
//     (not allowAllRoles) keeps gql/preview deployments denied and preserves
//     the first-user bootstrap bypass.
//   - filter.update: row scope — non-admins can only target their own record.
//   - ui.itemView.defaultFieldMode: every field read-only for non-admins; only
//     the password field opts back into edit mode, and only on one's own record.
//   - hooks.validateInput: column scope — a non-admin update may only change
//     the password (updatedAt/updatedBy are injected by addTrackingFields'
//     resolveInput on every update, so they must be exempt).
type FieldMode = 'edit' | 'read'
type FieldModeArgs = {
  session?: { data?: { id?: string; role?: string } }
  item?: { id?: unknown }
}

const SELF_PASSWORD_ROLES = ['moderator', 'editor', 'contributor', 'reporter']

const itemViewDefaultFieldMode = ({ session }: FieldModeArgs): FieldMode =>
  session?.data?.role === 'admin' ? 'edit' : 'read'

// Editable for admin anywhere, or for a self-service role on its OWN record.
// The item check matters here because mirrortv moderators can see every user
// (unlike mirrormedia, where non-admins only ever see themselves).
const passwordFieldMode = ({ session, item }: FieldModeArgs): FieldMode => {
  const role = session?.data?.role
  if (role === 'admin') return 'edit'
  const isSelf =
    item?.id !== undefined && String(item.id) === String(session?.data?.id)
  return role && SELF_PASSWORD_ROLES.includes(role) && isSelf ? 'edit' : 'read'
}

// Fields a non-admin update may carry besides nothing at all.
const SELF_SERVICE_ALLOWED_FIELDS = new Set([
  'password',
  'updatedAt',
  'updatedBy',
])

const listConfigurations = list({
  fields: {
    name: text({
      label: '姓名',
      validation: { isRequired: true },
    }),
    email: text({
      label: 'Email',
      validation: { isRequired: true },
      isIndexed: 'unique',
      isFilterable: true,
    }),
    password: password({
      label: '密碼',
      validation: { isRequired: true },
      ui: {
        itemView: {
          fieldMode: passwordFieldMode,
        },
      },
    }),
    role: select({
      label: '角色權限',
      type: 'string',
      options: [
        { label: 'admin', value: 'admin' },
        { label: 'bot', value: 'bot' },
        { label: 'contributor', value: 'contributor' },
        { label: 'editor', value: 'editor' },
        { label: 'moderator', value: 'moderator' },
        { label: 'reporter', value: 'reporter' },
      ],
      defaultValue: 'contributor',
      validation: { isRequired: true },
      access: {
        update: allowRolesForUsers(admin),
      },
    }),
    isProtected: checkbox({
      label: '受保護',
      defaultValue: false,
      access: {
        update: allowRolesForUsers(admin),
      },
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'role', 'email'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
    itemView: {
      defaultFieldMode: itemViewDefaultFieldMode,
    },
  },

  access: {
    operation: {
      query: allowAllRoles(reporter),
      update: allowRolesForUsers(
        admin,
        moderator,
        editor,
        contributor,
        reporter
      ),
      create: allowRolesForUsers(admin),
      delete: allowRolesForUsers(admin),
    },
    filter: {
      query: async (auth) => {
        if (admin(auth) || moderator(auth)) return true
        else {
          return {
            id: {
              equals: auth.session.data.id,
            },
          }
        }
      },
      // Row scope for self-service password change: non-admins can only
      // target their own record.
      update: async (auth) => {
        if (admin(auth)) return true
        const userId = auth.session?.data?.id
        if (!userId) return false
        return { id: { equals: userId } }
      },
    },
  },
  hooks: {
    validateInput: async ({
      operation,
      item,
      resolvedData,
      context,
      addValidationError,
    }) => {
      // Column guard for self-service updates: any non-admin (already scoped
      // to their own record by filter.update) may only change the password.
      // Runs on every update mutation, so it cannot be bypassed via GraphQL.
      if (operation === 'update' && context.session?.data?.role !== 'admin') {
        const changedFields = Object.keys(resolvedData).filter(
          (field) =>
            !SELF_SERVICE_ALLOWED_FIELDS.has(field) &&
            resolvedData[field] !== undefined &&
            resolvedData[field] !== item?.[field]
        )
        if (changedFields.length > 0) {
          addValidationError(
            `你只能修改自己的密碼，不可變更其他欄位（${changedFields.join(
              '、'
            )}）。`
          )
          return
        }
      }

      if (operation === 'update' && item?.isProtected) {
        if (resolvedData.isProtected !== false) {
          const protectedFields = ['name', 'email', 'role']
          const changedFields: string[] = []
          protectedFields.forEach((field) => {
            if (
              resolvedData[field] !== undefined &&
              resolvedData[field] !== item[field]
            ) {
              changedFields.push(field)
            }
          })
          if (changedFields.length > 0) {
            addValidationError(
              `此帳號已啟動「受保護」，${changedFields.join(
                '、'
              )}欄位不能被更動。如需更動，需先取消選取「受保護」再執行。`
            )
          }
        }
      }
    },

    beforeOperation: async ({ operation, item }) => {
      if (operation === 'delete' && item?.isProtected) {
        throw new Error(
          '此帳號已啟動「受保護」，無法刪除。如需刪除，請先取消選取「受保護」。'
        )
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
