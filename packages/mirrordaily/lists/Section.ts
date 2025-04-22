import { utils, customFields } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  select,
  checkbox,
  relationship,
  integer,
} from '@keystone-6/core/fields'
import envVar from '../environment-variables'
import { State, ACL, UserRole, type Session } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum SectionState {
  Active = State.Active,
  Inactive = State.Inactive,
}

type Option = {
  label: string
  value: string
  color: string
}

const COLOR_LIST = [
  '#FF5A36',
  '#FF69BA',
  '#E0AB00',
  '#03C121',
  '#00AEA4',
  '#6DB0E1',
  '#01D3F0',
  '#1C7CED',
  '#C668F2',
  '#FF800A',
  '#C0CB46',
  '#C69942',
  '#B867B9',
  '#4D8AA4',
]

const COLOR_OPTIONS: Option[] = COLOR_LIST.map((color) => ({
  label: color,
  value: color,
  color: color,
}))

function filterSections(roles: string[]) {
  return ({ session }: { session?: Session }) => {
    switch (envVar.accessControlStrategy) {
      case ACL.GraphQL: {
        // Expose `active` sections
        return { state: { equals: SectionState.Active } }
      }
      case ACL.Preview: {
        // Expose all sections
        return true
      }
      case ACL.CMS:
      default: {
        // Expose all sections if user logged in
        return (
          session?.data?.role !== undefined &&
          roles.indexOf(session.data.role) > -1
        )
      }
    }
  }
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    description: text({
      label: '簡介',
    }),
    color: customFields.selectWithColor({
      label: '顏色色碼',
      type: 'string',
      options: COLOR_OPTIONS,
      validation: {
        isRequired: true,
      },
      ui: {
        displayMode: 'select',
      },
    }),
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    order: integer({
      label: '排序',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    state: select({
      options: [
        { label: 'active', value: SectionState.Active },
        { label: 'inactive', value: SectionState.Inactive },
      ],
      validation: { isRequired: true },
      isIndexed: true,
      ui: { displayMode: 'segmented-control' },
      defaultValue: SectionState.Active,
    }),
    isFeatured: checkbox({
      label: '置頂',
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '圖片',
    }),
    categories: relationship({
      ref: 'Category.sections',
      label: '分類',
      many: true,
      ui: {
        labelField: 'name',
      },
    }),
    posts: relationship({
      ref: 'Post.sections',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    externals: relationship({
      ref: 'External.sections',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    topics: relationship({
      ref: 'Topic.sections',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    labelField: 'slug',
    listView: {
      initialColumns: ['id', 'slug', 'name', 'description', 'color'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  /*
  hooks: {
    validateInput: async ({
      operation,
      inputData,
      item,
      context,
      addValidationError,
    }) => {
      switch (operation) {
        case 'create': {
          const { color } = inputData

          if (color) {
            const matchedItems = await context.prisma.Section.findMany({
              where: {
                color: {
                  equals: color,
                },
              },
              select: {
                name: true,
                slug: true,
              },
            })

            if (matchedItems && matchedItems.length > 0) {
              addValidationError(
                `顏色 (${color}) 已被 ${matchedItems[0].name}(${matchedItems[0].slug}) 使用`
              )
            }
          }
          break
        }
        case 'update': {
          const { id } = item
          const { color } = inputData

          if (color) {
            const matchedItems = await context.prisma.Section.findMany({
              where: {
                color: {
                  equals: color,
                },
              },
              select: {
                id: true,
                name: true,
                slug: true,
              },
            })

            if (
              matchedItems &&
              matchedItems.length > 0 &&
              // @ts-ignore: i is any
              matchedItems.some((i) => String(i.id) !== String(id))
            ) {
              addValidationError(
                `顏色 (${color}) 已被 ${matchedItems[0].name}(${matchedItems[0].slug}) 使用`
              )
            }
          }
          break
        }
        default:
          break
      }
    },
  },
*/
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin),
      create: allowRoles(admin),
      delete: allowRoles(admin),
    },
    filter: {
      query: filterSections([
        UserRole.Admin,
        UserRole.Moderator,
        UserRole.Editor,
      ]),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
