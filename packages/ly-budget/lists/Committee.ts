import { graphql, list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { timestamp, text, relationship, virtual } from '@keystone-6/core/fields'
import { gqlReadOnly } from '../../access'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    term: relationship({
      label: '第幾屆立法院',
      ref: 'Term',
      many: false,
    }),
    startDate: timestamp({
      label: '起始年月日',
      validation: { isRequired: true },
    }),
    endDate: timestamp({
      label: '終止年月日',
      db: {
        isNullable: true,
      },
    }),
    session: text({
      label: '會期',
      validation: { isRequired: true },
    }),
    name: text({
      label: '委員會名稱',
      validation: { isRequired: true },
    }),
    members: relationship({
      label: '立委成員',
      many: true,
      ref: 'People.committees',
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
    displayName: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const data = await context.query.Committee.findOne({
            where: { id: String(item.id) },
            query: 'name session term { termNumber }',
          })
          const termNumber = data?.term?.termNumber
          const name = data?.name || ''
          const session = data?.session || ''
          return `${termNumber ? `第${termNumber}屆` : ''}${session ? ` 第${session}會期` : ''} ${name}`
        },
      }),
      ui: {
        description: '供後台標籤顯示用',
        listView: { fieldMode: 'hidden' },
      },
    }),
    key: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const data = await context.query.Committee.findOne({
            where: { id: String(item.id) },
            query: 'name session term { termNumber }',
          })
          const termNumber = data?.term?.termNumber
          const name = data?.name || ''
          const session = data?.session || ''
          return `${termNumber}-${session}-${name}`
        },
      }),
    }),
  },

  ui: {
    labelField: 'displayName',
    listView: {
      initialColumns: ['displayName', 'session', 'startDate', 'endDate'],
    },
  },
  access: {
    operation: gqlReadOnly(),
  },
  hooks: {
    validateInput: async ({ operation, resolvedData, item, addValidationError, context }) => {
      // 只在 create 或 update 且有改動 term/name 時檢查
      const termId = resolvedData.term?.connect?.id ?? item?.termId
      const name = resolvedData.name ?? item?.name

      if (!termId || !name) return // term 或 name 為空時略過（required 由 field validation 處理）

      // 查詢是否已存在相同 term + name 的記錄（排除自己）
      const existing = await context.query.Committee.findMany({
        where: {
          term: { id: { equals: termId } },
          name: { equals: name },
          ...(operation === 'update' && item?.id ? { id: { not: { equals: String(item.id) } } } : {}),
        },
        query: 'id',
      })

      if (existing.length > 0) {
        addValidationError('此屆立法院已存在相同名稱的委員會')
      }
    },
  },
})

export default listConfigurations
