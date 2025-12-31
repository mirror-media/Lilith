import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'

import { text, password, select, checkbox } from '@keystone-6/core/fields'

const { allowRolesForUsers, allowAllRoles, admin, moderator } =
  utils.accessControl

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
  },
  access: {
    operation: {
      query: allowAllRoles(),
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
  hooks: {},
})

export default listConfigurations
