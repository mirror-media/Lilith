import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, float, select, integer, relationship, multiselect } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const proposalTypeOptions = [
  { value: 'freeze', label: '凍結' },
  { value: 'reduce', label: '刪減' },
  { value: 'other', label: '其他建議' },
]

const resultOptions = [
  { value: 'passed', label: '通過' },
  { value: 'withdrawn', label: '撤案' },
  { value: 'reserved', label: '保留' },
]

const unfreezeStatusOptions = [
  { value: 'not_reviewed', label: '尚未審議' },
  { value: 'reviewing', label: '審議中' },
  { value: 'unfrozen', label: '已解凍' },
]

const publishStatusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已發布' },
]

const listConfigurations = list({
  fields: {
    government: relationship({
      label: '部會',
      ref: 'Government',
    }),
    meetings: relationship({
      label: '會議',
      many: true,
      ref: 'Meeting',
    }),
    year: relationship({
      label: '年度',
      ref: 'BudgetYear.proposals',
      many: false,
      ui: {
        displayMode: 'select',
        labelField: 'year',
      },
    }),
    mergedProposals: relationship({
      label: '併案子提案單',
      many: true,
      ref: 'Proposal.mergedParentProposals',
    }),
    mergedParentProposals: relationship({
      label: '併案母提案單',
      many: false,
      ref: 'Proposal.mergedProposals',
    }),
    historicalProposals: relationship({
      label: '歷史子提案單',
      many: true,
      ref: 'Proposal.historicalParentProposals',
    }),
    historicalParentProposals: relationship({
      label: '歷史母提案單',
      many: false,
      ref: 'Proposal.historicalProposals',
    }),
    proposers: relationship({
      label: '提案人',
      many: true,
      ref: 'People',
    }),
    coSigners: relationship({
      label: '連署人',
      many: true,
      ref: 'People',
    }),
    proposalTypes: multiselect({
      label: '提案類型',
      type: 'enum',
      options: proposalTypeOptions,
      db: { map: 'proposal_types' },
    }),
    result: select({
      label: '審議結果',
      options: resultOptions,
      db: {
        isNullable: true,
      },
    }),
    reductionAmount: float({
      label: '減列金額',
      db: {
        isNullable: true,
      },
    }),
    freezeAmount: float({
      label: '凍結金額',
      db: {
        isNullable: true,
      },
    }),
    budgetImageUrl: text({
      label: '預算書圖檔',
      db: {
        isNullable: true,
      },
    }),
    budget: relationship({
      label: '預算科目',
      ref: 'Budget',
    }),
    unfreezeStatus: select({
      label: '解凍狀態',
      options: unfreezeStatusOptions,
      db: {
        isNullable: true,
      },
    }),
    unfreezeHistory: relationship({
      label: '解凍歷程',
      many: true,
      ref: 'Meeting',
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
    reason: text({
      label: '案由',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
    react_good: integer({
      label: '心情—讚',
	    defaultValue: 0,
    }),
    react_angry: integer({
      label: '心情—怒',
	    defaultValue: 0
    }),
    react_whatever: integer({
      label: '心情—隨便',
	    defaultValue: 0
    }),
    react_disappoint: integer({
      label: '心情—失望',
	    defaultValue: 0
    }),
    recognitionAnswer: text({
      label: '辨識答案',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
    publishStatus: select({
      label: '發布狀態',
      options: publishStatusOptions,
      defaultValue: 'draft',
      isIndexed: true,
    }),
  },

  ui: {
    listView: {
      initialColumns: ['government', 'proposalTypes', 'result', 'reductionAmount', 'freezeAmount'],
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

export default listConfigurations
