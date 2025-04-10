import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'

import {
  text,
  password,
  select,
  checkbox,
  relationship,
} from '@keystone-6/core/fields'
import type {
  BaseAccessArgs,
  FieldUpdateItemAccessArgs,
} from '@keystone-6/core/dist/declarations/src/types/config/access-control'
import type { BaseListTypeInfo, MaybePromise } from '@keystone-6/core/types'

const { allowRolesForUsers, admin, moderator, editor } = utils.accessControl

const isOwner = (
  auth: FieldUpdateItemAccessArgs<BaseListTypeInfo>
): MaybePromise<boolean> => {
  return Number(auth.session?.data.id) === Number(auth.item.id)
}

export const contributor = (auth: BaseAccessArgs<BaseListTypeInfo>) => {
  const user = auth?.session?.data
  return Boolean(user && user.role === 'contributor')
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '姓名',
      validation: { isRequired: true },
      access: {
        update: allowRolesForUsers(admin),
      },
    }),
    email: text({
      label: 'Email',
      validation: { isRequired: true },
      isIndexed: 'unique',
      isFilterable: true,
      access: {
        update: allowRolesForUsers(admin),
      },
    }),
    password: password({
      label: '密碼',
      validation: { isRequired: true },
      access: {
        update: allowRolesForUsers(admin),
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
      access: {
        update: allowRolesForUsers(admin),
      },
    }),
    sections: relationship({
      label: '大分類（即將被棄用，請到對應作者底下做設定）',
      ref: 'Section',
      many: true,
      ui: {
        labelField: 'name',
      },
      access: {
        update: async (auth) => {
          if (admin(auth)) return true
          else if (moderator(auth)) {
            if (isOwner(auth)) return true
            else {
              const data = await auth.context.prisma.User.findUnique({
                where: {
                  id: auth.item.id,
                },
                select: {
                  id: true,
                  role: true,
                },
              })

              if (['editor', 'contributor'].includes(data.role)) {
                return true
              }

              return false
            }
          } else return false
        },
      },
    }),
    author: relationship({
      label: '作者',
      ref: 'Contact',
      many: false,
      ui: {
        labelField: 'name',
      },
      access: {
        update: async (auth) => {
          if (admin(auth)) return true
          else if (moderator(auth)) {
            if (isOwner(auth)) return true
            else {
              const data = await auth.context.prisma.User.findUnique({
                where: {
                  id: auth.item.id,
                },
                select: {
                  id: true,
                  role: true,
                },
              })

              if (['editor', 'contributor'].includes(data.role)) {
                return true
              }

              return false
            }
          } else return false
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
      initialColumns: ['id', 'name', 'role', 'email', 'author'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRolesForUsers(admin, moderator, editor, contributor),
      update: allowRolesForUsers(admin, moderator),
      create: allowRolesForUsers(admin),
      delete: allowRolesForUsers(admin),
    },
    filter: {
      query: async (auth) => {
        if (admin(auth)) return true
        else if (moderator(auth)) {
          return {
            role: {
              in: ['moderator', 'editor', 'contributor'],
            },
          }
        } else {
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
