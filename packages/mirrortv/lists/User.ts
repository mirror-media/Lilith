import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, password, select, checkbox } from '@keystone-6/core/fields'
const { allowRolesForUsers, admin, moderator, editor } = utils.accessControl

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
  },

  access: {
    operation: {
      query: allowRolesForUsers(admin, moderator, editor),
      update: allowRolesForUsers(admin),
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
    },
  },
  hooks: {
    validateInput: async ({
      operation,
      item,
      resolvedData,
      addValidationError,
    }) => {
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

export default listConfigurations
