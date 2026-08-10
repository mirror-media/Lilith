import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'

import {
  text,
  password,
  select,
  checkbox,
  relationship,
} from '@keystone-6/core/fields'

const { allowRolesForUsers, allowAllRoles, admin, moderator, editor } =
  utils.accessControl

// Editors may change ONLY their own password (security: external reporter accounts
// must move off the shared password). Everything else stays admin-only.
//
// Centralized "default-deny" design (fail-safe for fields added later):
//   - operation.update: widened to admin + editor. We keep allowRolesForUsers (not
//     allowAllRoles) so gql/preview deployments stay denied without a session and
//     the first-user bootstrap bypass is preserved.
//   - filter.update: row scope — non-admins can only target their own record.
//   - ui.itemView.defaultFieldMode: every field is read-only for non-admins; only
//     the password field opts back into edit mode for admin/editor.
//   - hooks.validateInput: column scope — a non-admin update may only change the
//     password; touching any other field is rejected (no privilege escalation).
type FieldMode = 'edit' | 'read'
type SessionArg = { session?: { data?: { role?: string } } }

const itemViewDefaultFieldMode = ({ session }: SessionArg): FieldMode =>
  session?.data?.role === 'admin' ? 'edit' : 'read'

const passwordFieldMode = ({ session }: SessionArg): FieldMode => {
  const role = session?.data?.role
  return role === 'admin' || role === 'editor' ? 'edit' : 'read'
}

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
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'moderator',
          value: 'moderator',
        },
        {
          label: 'editor',
          value: 'editor',
        },
        {
          label: 'contributor',
          value: 'contributor',
        },
      ],
      validation: { isRequired: true },
    }),
    sections: relationship({
      label: '大分類（即將被棄用，請到對應作者底下做設定）',
      ref: 'Section',
      many: true,
      ui: {
        labelField: 'name',
      },
    }),
    author: relationship({
      label: '作者',
      ref: 'Contact',
      many: false,
      ui: {
        labelField: 'name',
      },
    }),
    isProtected: checkbox({
      defaultValue: false,
    }),
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'role', 'email', 'author'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
    itemView: {
      defaultFieldMode: itemViewDefaultFieldMode,
    },
  },
  access: {
    operation: {
      query: allowAllRoles(),
      update: allowRolesForUsers(admin, editor),
      create: allowRolesForUsers(admin),
      delete: allowRolesForUsers(admin),
    },
    filter: {
      query: async (auth) => {
        if (admin(auth) || moderator(auth)) return true
        const userId = auth.session?.data?.id
        if (!userId) return false
        return { id: { equals: userId } }
      },
      // Non-admins (in practice an editor) can only target their own record.
      update: async (auth) => {
        if (admin(auth)) return true
        const userId = auth.session?.data?.id
        if (!userId) return false
        return { id: { equals: userId } }
      },
    },
  },
  hooks: {
    // Column-level guard. Admins may edit everything; any other role (in practice an
    // editor already scoped to their own record by filter.update) may only change the
    // password. Runs on every update mutation, so it cannot be bypassed via GraphQL.
    validateInput: async ({
      operation,
      resolvedData,
      context,
      addValidationError,
    }) => {
      if (operation !== 'update') return
      if (context.session?.data?.role === 'admin') return

      // Reject any non-password field that is present in this update. Presence is
      // enough — don't diff against the stored value: relationship fields arrive as
      // Prisma nested-write objects (e.g. { disconnect: true }) while the item holds a
      // scalar FK, so a value comparison would be meaningless.
      const changed = resolvedData as Record<string, unknown>
      const changedFields = Object.keys(changed).filter(
        (field) => field !== 'password' && changed[field] !== undefined
      )
      if (changedFields.length > 0) {
        addValidationError(
          `你只能修改自己的密碼，不可變更其他欄位（${changedFields.join(
            '、'
          )}）。`
        )
      }
    },
  },
})

export default listConfigurations
