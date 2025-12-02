import { list, graphql } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, float, select, integer, relationship, multiselect, virtual } from '@keystone-6/core/fields'
import { gqlReadOnly } from '../access'

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

// 輔助函數：獲取 budget ID
async function getBudgetId(item: Record<string, any>, context: any): Promise<string | null> {
  let budgetId: string | null = null
  
  // 嘗試從 item.budget 獲取 ID
  if (item.budget) {
    if (typeof item.budget === 'object' && item.budget !== null && 'id' in item.budget) {
      budgetId = String(item.budget.id)
    } else if (typeof item.budget === 'string') {
      budgetId = item.budget
    }
  }
  
  // 如果 item.budget 沒有 ID，嘗試通過查詢 Proposal 來獲取 budget ID
  if (!budgetId && item.id) {
    try {
      const proposalData = await context.query.Proposal.findOne({
        where: { id: String(item.id) },
        query: 'budget { id }',
      })
      if (proposalData?.budget?.id) {
        budgetId = String(proposalData.budget.id)
      }
    } catch (error) {
      console.error('查詢 Proposal budget 錯誤:', error)
    }
  }
  
  return budgetId
}

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
    budgetAmount: virtual({
      label: '編列金額（用於排序）',
      field: graphql.field({
        type: graphql.Float,
        async resolve(item: Record<string, any>, args, context) {
          const budgetId = await getBudgetId(item, context)
          if (!budgetId) {
            return null
          }
          
          try {
            const budgetData = await context.query.Budget.findOne({
              where: { id: budgetId },
              query: 'budgetAmount',
            })
            return budgetData?.budgetAmount ?? null
          } catch (error) {
            console.error('查詢 Budget budgetAmount 錯誤:', error)
            return null
          }
        },
      }),
      ui: {
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'read' },
        createView: { fieldMode: 'hidden' },
      },
    }),
    budgetMajorCategory: virtual({
      label: '大科目名稱（用於過濾）',
      field: graphql.field({
        type: graphql.String,
        async resolve(item: Record<string, any>, args, context) {
          const budgetId = await getBudgetId(item, context)
          if (!budgetId) {
            return null
          }
          
          try {
            const budgetData = await context.query.Budget.findOne({
              where: { id: budgetId },
              query: 'majorCategory',
            })
            return budgetData?.majorCategory ?? null
          } catch (error) {
            console.error('查詢 Budget majorCategory 錯誤:', error)
            return null
          }
        },
      }),
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
    }),
    budgetMediumCategory: virtual({
      label: '中科目名稱（用於過濾）',
      field: graphql.field({
        type: graphql.String,
        async resolve(item: Record<string, any>, args, context) {
          const budgetId = await getBudgetId(item, context)
          if (!budgetId) {
            return null
          }
          
          try {
            const budgetData = await context.query.Budget.findOne({
              where: { id: budgetId },
              query: 'mediumCategory',
            })
            return budgetData?.mediumCategory ?? null
          } catch (error) {
            console.error('查詢 Budget mediumCategory 錯誤:', error)
            return null
          }
        },
      }),
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
    }),
    budgetMinorCategory: virtual({
      label: '小科目名稱（用於過濾）',
      field: graphql.field({
        type: graphql.String,
        async resolve(item: Record<string, any>, args, context) {
          const budgetId = await getBudgetId(item, context)
          if (!budgetId) {
            return null
          }
          
          try {
            const budgetData = await context.query.Budget.findOne({
              where: { id: budgetId },
              query: 'minorCategory',
            })
            return budgetData?.minorCategory ?? null
          } catch (error) {
            console.error('查詢 Budget minorCategory 錯誤:', error)
            return null
          }
        },
      }),
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
    }),
    budgetProjectName: virtual({
      label: '計畫名稱（用於過濾）',
      field: graphql.field({
        type: graphql.String,
        async resolve(item: Record<string, any>, args, context) {
          const budgetId = await getBudgetId(item, context)
          if (!budgetId) {
            return null
          }
          
          try {
            const budgetData = await context.query.Budget.findOne({
              where: { id: budgetId },
              query: 'projectName',
            })
            return budgetData?.projectName ?? null
          } catch (error) {
            console.error('查詢 Budget projectName 錯誤:', error)
            return null
          }
        },
      }),
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
    }),
    budgetType: virtual({
      label: '預算類型（用於過濾）',
      field: graphql.field({
        type: graphql.String,
        async resolve(item: Record<string, any>, args, context) {
          const budgetId = await getBudgetId(item, context)
          if (!budgetId) {
            return null
          }
          
          try {
            const budgetData = await context.query.Budget.findOne({
              where: { id: budgetId },
              query: 'type',
            })
            return budgetData?.type ?? null
          } catch (error) {
            console.error('查詢 Budget type 錯誤:', error)
            return null
          }
        },
      }),
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
    }),
    budgetYear: virtual({
      label: '預算年度（用於過濾）',
      field: graphql.field({
        type: graphql.Int,
        async resolve(item: Record<string, any>, args, context) {
          const budgetId = await getBudgetId(item, context)
          if (!budgetId) {
            return null
          }
          
          try {
            const budgetData = await context.query.Budget.findOne({
              where: { id: budgetId },
              query: 'year',
            })
            return budgetData?.year ?? null
          } catch (error) {
            console.error('查詢 Budget year 錯誤:', error)
            return null
          }
        },
      }),
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
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
    operation: gqlReadOnly() as any,
  },
})

export default listConfigurations
