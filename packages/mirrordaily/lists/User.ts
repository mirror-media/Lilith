import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'

import {
  text,
  password,
  select,
  checkbox,
  relationship,
} from '@keystone-6/core/fields'

const { allowRolesForUsers, admin, moderator } = utils.accessControl

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
      label: '大分類',
      ref: 'Section',
      many: true,
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
      initialColumns: ['id', 'name', 'role'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRolesForUsers(admin, moderator),
      update: allowRolesForUsers(admin),
      create: allowRolesForUsers(admin),
      delete: allowRolesForUsers(admin),
    },
  },
  hooks: {},
})

export default listConfigurations
