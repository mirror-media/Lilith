import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    category: text({
      label: '大分類名稱',
      validation: { isRequired: true },
    }),
    name: text({
      label: '名稱',
      validation: { isRequired: true },
    }),
    description: text({
      label: '說明',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
  },

  ui: {
    listView: {
      initialColumns: ['category', 'name'],
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
  hooks: {
    validateInput: async ({ operation, resolvedData, item, addValidationError, context }) => {
      // 只在 create 或 update 且有改動 category/name 時檢查
      const category = resolvedData.category ?? item?.category
      const name = resolvedData.name ?? item?.name

      if (!category || !name) return // category 或 name 為空時略過（required 由 field validation 處理）

      // 查詢是否已存在相同 category + name 的記錄（排除自己）
      const existing = await context.query.Government.findMany({
        where: {
          category: { equals: category },
          name: { equals: name },
          ...(operation === 'update' && item?.id ? { id: { not: { equals: String(item.id) } } } : {}),
        },
        query: 'id',
      })

      if (existing.length > 0) {
        addValidationError('此大分類下已存在相同名稱的單位')
      }
    },
  },
})

export default listConfigurations
