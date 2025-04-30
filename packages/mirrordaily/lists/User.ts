import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'

import {
  text,
  password,
  select,
  checkbox,
  relationship,
} from '@keystone-6/core/fields'

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
  hooks: {},
})

export default listConfigurations
