import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, select, text, integer } from '@keystone-6/core/fields'
import envVar from '../environment-variables'
import { State, ACL, UserRole, type Session } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum CategoryState {
  Active = State.Active,
  Inactive = State.Inactive,
}

function filterCategories(roles: string[]) {
  return ({ session }: { session?: Session }) => {
    switch (envVar.accessControlStrategy) {
      case ACL.GraphQL: {
        // Expose `active` categories
        return { state: { equals: CategoryState.Active } }
      }
      case ACL.Preview: {
        // Expose all categories
        return true
      }
      case ACL.CMS:
      default: {
        // Expose all categories if user logged in
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
        { label: 'active', value: CategoryState.Active },
        { label: 'inactive', value: CategoryState.Inactive },
      ],
      isIndexed: true,
      validation: { isRequired: true },
      ui: { displayMode: 'segmented-control' },
      defaultValue: CategoryState.Active,
    }),
    heroImage: relationship({
      label: 'Banner圖片',
      ref: 'Photo',
    }),
    sections: relationship({
      ref: 'Section.categories',
      label: 'Sections',
      many: true,
      ui: {
        labelField: 'name',
        displayMode: 'select',
      },
    }),
    posts: relationship({
      ref: 'Post.categories',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    externals: relationship({
      ref: 'External.categories',
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
      initialColumns: ['id', 'slug', 'name', 'order'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin),
      create: allowRoles(admin),
      delete: allowRoles(admin),
    },
    filter: {
      query: filterCategories([
        UserRole.Admin,
        UserRole.Moderator,
        UserRole.Editor,
      ]),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
