import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { integer, relationship, select, text } from '@keystone-6/core/fields'
import { gqlReadAndCreate } from '../../access'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const resultOptions = [
  { value: 'passed', label: '通過' },
  { value: 'withdrawn', label: '撤案' },
  { value: 'reserved', label: '保留' },
]

const listConfigurations = list({
  fields: {
    meeting: relationship({
      label: '會議',
      ref: 'Meeting',
      ui: {
        labelField: 'displayName',
      },
    }),
    imageUrl: text({
      label: '圖片 url',
      validation: { isRequired: true },
    }),
    pageNumber: integer({
      label: '頁數',
      db: {
        isNullable: true,
      },
    }),
    government: relationship({
      label: '部會',
      ref: 'Government',
    }),
    historicalProposals: relationship({
      label: '歷史子提案單',
      many: true,
      ref: 'Proposal',
    }),
    mergedProposals: relationship({
      label: '併案子提案單',
      many: true,
      ref: 'Proposal',
    }),
    result: select({
      label: '審議結果',
      options: resultOptions,
      db: {
        isNullable: true,
      },
    }),
    verificationStatus: select({
      label: '驗證狀態',
      options: [
        { value: 'verified', label: '已驗證' },
        { value: 'not_verified', label: '未驗證' },
      ],
      defaultValue: 'not_verified',
      isIndexed: true,
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

  hooks: {
    async afterOperation({ operation, item, originalItem, context }) {
      if (operation !== 'create' && operation !== 'update') return
      if (item?.verificationStatus !== 'verified') return
      if (originalItem && originalItem.verificationStatus === 'verified') return

      const image = await context.query.RecognitionImage.findOne({
        where: { id: String(item.id) },
        query:
          'id imageUrl meeting { id } government { id } mergedProposals { id } historicalProposals { id } result',
      })

      // 直接建立 Proposal，不做查重

      // 取對應的辨識/驗證結果，優先 type = 'verification'
      const statuses = await context.query.RecognitionStatus.findMany({
        where: { image: { id: { equals: item.id } } },
        query:
          'type governmentBudgetResult budgetCategoryResult budgetAmountResult budgetTypeResult reductionAmountResult freezeAmountResult reason proposers coSigners',
      })
      const pick =
        statuses.find((s: any) => s.type === 'verification') || statuses[0]

      const toNumber = (input?: string | null) => {
        if (!input) return undefined
        const sanitized = String(input).replace(/[^0-9.-]/g, '')
        if (sanitized === '') return undefined
        const n = Number(sanitized)
        return Number.isFinite(n) ? n : undefined
      }

      const mapProposalType = (t?: string | null) => {
        if (!t) return ['other']
        const values: string[] = []
        if (t.includes('凍結')) values.push('freeze')
        if (t.includes('刪減')) values.push('reduce')
        if (values.length === 0) values.push('other')
        return values
      }

      const names = (s?: string | null) => (s ? String(s) : '')

      const lines: string[] = []
      if (pick?.governmentBudgetResult)
        lines.push(`辨識結果-部會預算：${pick.governmentBudgetResult}`)
      if (pick?.budgetCategoryResult)
        lines.push(`辨識結果-預算科目：${pick.budgetCategoryResult}`)
      if (pick?.budgetAmountResult)
        lines.push(`辨識結果-預算金額：${pick.budgetAmountResult}`)
      if (pick?.proposers)
        lines.push(`提案人：${names(pick.proposers)}`)
      if (pick?.coSigners)
        lines.push(`連署人：${names(pick.coSigners)}`)

      const data: Record<string, any> = {
        publishStatus: 'draft',
        recognitionAnswer: lines.join('\n'),
        proposalTypes: mapProposalType(pick?.budgetTypeResult),
        reductionAmount: toNumber(pick?.reductionAmountResult),
        freezeAmount: toNumber(pick?.freezeAmountResult),
        reason: pick?.reason || undefined,
        budgetImageUrl: image?.imageUrl || undefined,
      }

      // 一律建立新的 Proposal

      if (image?.result) data.result = image.result
      if (image?.government?.id)
        data.government = { connect: { id: image.government.id } }
      if (image?.meeting?.id)
        data.meetings = { connect: [{ id: image.meeting.id }] }
      if (image?.mergedProposals?.length)
        data.mergedProposals = {
          connect: image.mergedProposals.map((p: any) => ({ id: p.id })),
        }
      if (image?.historicalProposals?.length)
        data.historicalProposals = {
          connect: image.historicalProposals.map((p: any) => ({ id: p.id })),
        }
      // 提案人/連署人改為文字，直接寫入 recognitionAnswer，不建立關聯

      await context.query.Proposal.createOne({
        data,
        query: 'id',
      })
    },
  },

  ui: {
    listView: {
      initialColumns: ['meeting', 'imageUrl', 'pageNumber', 'government', 'verificationStatus'],
    },
  },
  access: {
    operation: gqlReadAndCreate(),
  },
})

export default listConfigurations
