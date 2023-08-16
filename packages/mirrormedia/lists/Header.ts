import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, integer } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    order: integer({
      label: '排序',
      validation: {
        min: 1,
        max: 9999,
      },
      isIndexed: 'unique',
    }),
    section: relationship({
      ref: 'Section',
      label: '大分類',
    }),
    category: relationship({
      ref: 'Category',
      label: '小分類',
    }),
  },
  hooks: {
    validateInput: ({ resolvedData, addValidationError }) => {
      const { section } = resolvedData
      const { category } = resolvedData
      if (section !== undefined && category !== undefined) {
        addValidationError('大分類跟小分類只要選擇其中一個')
      } else if (section === undefined && category === undefined) {
        addValidationError('大分類跟小分類至少選擇其中一個')
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
