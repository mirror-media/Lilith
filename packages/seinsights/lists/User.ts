import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'

import { text, password, select } from '@keystone-6/core/fields'

const { allowRolesForUsers, admin, moderator, contributor, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
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
    name: text({
      label: '姓名',
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
  },

  ui: {
    listView: {
      initialColumns: ['name', 'role'],
    },
  },
  access: {
    operation: {
      query: allowRolesForUsers(admin, moderator, editor, contributor),
      update: allowRolesForUsers(admin, moderator),
      create: allowRolesForUsers(admin, moderator),
      delete: allowRolesForUsers(admin),
    },
  },
  hooks: {},
})

export default listConfigurations
