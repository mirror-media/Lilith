import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { integer, select, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    year: integer({
      label: '年份',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    budgetProgress: select({
      label: '預算進度',
      options: [
        { label: '中央政府提出預算', value: 'government-proposed' },
        { label: '立法院審議', value: 'legislature-review' },
        { label: '完成預算審查', value: 'review-completed' },
      ],
      validation: { isRequired: true },
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    dataProgress: select({
      label: '資料進度',
      options: [
        { label: '進行中', value: 'in-progress' },
        { label: '已完成', value: 'completed' },
      ],
      validation: { isRequired: true },
      defaultValue: 'in-progress',
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    proposals: relationship({
      label: '提案',
      ref: 'Proposal.year',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  ui: {
    labelField: 'year',
    listView: {
      initialColumns: ['year', 'budgetProgress', 'dataProgress'],
      initialSort: { field: 'year', direction: 'DESC' },
      pageSize: 50,
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

