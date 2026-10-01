import { list } from '@keystone-6/core'
// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'

import { text, password, select, checkbox } from '@keystone-6/core/fields'
import envVar from '../environment-variables'

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
    isProtected: checkbox({
      defaultValue: false,
    }),
    isPasswordLoginAllowed: checkbox({
      label: '允許 API 登入',
      defaultValue: false,
      access: {
        read: () => true,
        create: ({ session }) => session?.data?.role === 'admin',
        update: ({ session }) => session?.data?.role === 'admin',
      },
      ui: {
        description:
          '警告：勾選後此帳號可用帳號密碼透過 GraphQL 登入，等於繞過 Google 登入。僅限程式用的服務帳號，不要給一般使用者。',
        itemView: {
          fieldMode: ({ session }) =>
            envVar.googleAuth.isEnabled && session?.data?.role === 'admin'
              ? 'edit'
              : 'read',
        },
        createView: {
          fieldMode: ({ session }) =>
            envVar.googleAuth.isEnabled && session?.data?.role === 'admin'
              ? 'edit'
              : 'hidden',
        },
      },
    }),
    // posts: relationship({ ref: 'Post.author', many: true }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'role'],
    },
  },
  access: {
    operation: {
      query: allowRolesForUsers(admin, moderator, editor),
      update: allowRolesForUsers(admin, moderator),
      create: allowRolesForUsers(admin, moderator),
      delete: allowRolesForUsers(admin),
    },
  },
  hooks: {},
})

export default listConfigurations
