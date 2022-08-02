import { list, graphql } from '@keystone-6/core'
import {
  integer,
  text,
  relationship,
  checkbox,
  virtual,
} from '@keystone-6/core/fields'
import { utils } from '@mirrormedia/lilith-core'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    breadcrumb: virtual({
      label: '麵包屑',
      field: graphql.field({
        type: graphql.String,
        resolve: async (
          item: Record<string, unknown>,
          args,
          context
        ): Promise<string> => {
          const catId =
            typeof item?.categoryId === 'number'
              ? item.categoryId.toString()
              : null
          // Classify item does not belong to any Category item
          if (catId === null) {
            return item?.name as string
          }
          // Find the Category item the Classify item belongs to
          const category = await context.query.Category.findOne({
            where: { id: catId },
            query: 'slug name group { name }',
          })
          // Category item does not belong to any Group item
          if (!category?.group?.name) {
            return `${category?.name}>${item.name}`
          }

          // Return full path
          return `${category?.group?.name}>${category?.name}>${item.name}`
        },
      }),
    }),
    name: text({ label: '名稱' }),
    slug: text({
      label: 'Slug（必填）',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    category: relationship({
      ref: 'Category.classify',
      validation: {
        isRequired: true,
      },
      db: {
        isNullable: false,
      },
      ui: {
        hideCreate: true,
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    weight: integer({
      label: '權重',
      defaultValue: 3,
    }),
    active: checkbox({ label: '啟用', defaultValue: true }),
    posts: relationship({
      ref: 'Post.classify',
      ui: {
        hideCreate: true,
      },
      many: true,
    }),
  },
  ui: {
    labelField: 'breadcrumb',
  },
  hooks: {
    validateInput: async ({ operation, inputData, addValidationError }) => {
      if (operation == 'create') {
        if (!('category' in inputData)) {
          addValidationError('目錄不能空白')
        }
      }
      if (operation == 'update') {
        if (
          'category' in inputData &&
          'disconnect' in inputData['category'] &&
          inputData['category']['disconnect'] == true
        ) {
          addValidationError('目錄不能空白')
        }
      }
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
