import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, select, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const typeOptions = [
  { value: 'legislator', label: '立法委員' },
  { value: 'party', label: '黨團' },
]

const listConfigurations = list({
  graphql: {
    plural: 'PeopleList',
  },
  fields: {
    type: select({
      label: '類型',
      options: typeOptions,
      validation: { isRequired: true },
    }),
    name: text({
      label: '姓名',
      validation: { isRequired: true },
    }),
    term: relationship({
      label: '屆',
      ref: 'Term',
      many: false,
    }),
    party: relationship({
      label: '政黨',
      ref: 'Party',
      many: false,
    }),
    committees: relationship({
      label: '委員會',
      many: true,
      ref: 'Committee',
    }),
    description: text({
      label: '說明',
      ui: {
        displayMode: 'textarea',
      },
    }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'type', 'term', 'party'],
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
      // 只在 create 或 update 且有改動 name/term 時檢查
      const termId = resolvedData.term?.connect?.id ?? item?.termId
      const name = resolvedData.name ?? item?.name

      if (!termId || !name) return // term 或 name 為空時略過（required 由 field validation 處理）

      // 查詢是否已存在相同 term + name 的記錄（排除自己）
      const existing = await context.query.People.findMany({
        where: {
          term: { id: { equals: termId } },
          name: { equals: name },
          ...(operation === 'update' && item?.id ? { id: { not: { equals: String(item.id) } } } : {}),
        },
        query: 'id',
      })

      if (existing.length > 0) {
        addValidationError('此屆立法院已存在相同姓名的人員')
      }
    },
  },
})

export default listConfigurations
