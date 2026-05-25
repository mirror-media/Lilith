import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'

import { text, password, select, checkbox } from '@keystone-6/core/fields'

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
    slugCode: text({
      label: '手機上稿專用slug代號',
      validation: {
        isRequired: false,
        length: {
          max: 3,
        },
        match: {
          regex: /^[a-zA-Z0-9]*$/,
          explanation: '只能輸入英文字母和數字，不能包含空白或特殊符號',
        },
      },
    }),
    isProtected: checkbox({
      defaultValue: false,
    }),
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'role'],
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
      item,
      resolvedData,
      context,
      addValidationError,
    }) => {
      if (operation !== 'update') return
      if (context.session?.data?.role === 'admin') return

      const changed = resolvedData as Record<string, unknown>
      const previous = (item ?? {}) as Record<string, unknown>
      const changedFields = Object.keys(changed).filter(
        (field) =>
          field !== 'password' &&
          changed[field] !== undefined &&
          changed[field] !== previous[field]
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
