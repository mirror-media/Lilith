import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { integer, select, relationship } from '@keystone-6/core/fields'
import { gqlReadOnly } from '../access'

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
        { label: '立法院委員會審議', value: 'committee-review' },
        { label: '黨團協商', value: 'party-negotiation' },
        { label: '院會決議', value: 'plenary-decision' },
        { label: '預算三讀通過', value: 'final-reviewed' },
        { label: '預算總統公布', value: 'presidential-promulgation' },
      ],
      validation: { isRequired: true },
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
    operation: gqlReadOnly(),
  },
})

export default utils.addTrackingFields(listConfigurations)

