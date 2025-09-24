import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { relationship, select, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const typeOptions = [
  { value: 'recognition', label: '辨識' },
  { value: 'verification', label: '驗證' },
]

const listConfigurations = list({
  fields: {
    image: relationship({
      label: '圖檔',
      ref: 'RecognitionImage',
    }),
    type: select({
      label: '種類',
      options: typeOptions,
      validation: { isRequired: true },
    }),
    governmentBudgetResult: text({
      label: '辨識結果-部會預算',
      db: {
        isNullable: true,
      },
    }),
    budgetCategoryResult: text({
      label: '辨識結果-預算科目',
      db: {
        isNullable: true,
      },
    }),
    budgetAmountResult: text({
      label: '辨識結果-預算金額',
      db: {
        isNullable: true,
      },
    }),
    budgetTypeResult: text({
      label: '辨識結果-預算類型',
      db: {
        isNullable: true,
      },
    }),
    reductionAmountResult: text({
      label: '辨識結果-減列金額',
      db: {
        isNullable: true,
      },
    }),
    freezeAmountResult: text({
      label: '辨識結果-凍結金額',
      db: {
        isNullable: true,
      },
    }),
    proposers: text({
      label: '提案人',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
    coSigners: text({
      label: '連署人',
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
    lineuserid: text({
      label: 'lineuserid',
      db: {
        isNullable: true,
      },
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
    async afterOperation({ operation, item, context }) {
      if (operation !== 'create' && operation !== 'update') return

      // 取得目前這筆完整資料
      const current = await context.query.RecognitionStatus.findOne({
        where: { id: String(item.id) },
        query:
          'id type governmentBudgetResult budgetCategoryResult budgetAmountResult budgetTypeResult reductionAmountResult freezeAmountResult reason proposers coSigners image { id imageUrl }',
      })
      const imageId = current?.image?.id
      const imageUrl = current?.image?.imageUrl
      if (!imageId || !imageUrl) return

      // 找出相同 image 的其他紀錄
      const prevList = await context.query.RecognitionStatus.findMany({
        where: { AND: [{ image: { id: { equals: imageId } } }, { id: { not: { equals: String(item.id) } } }] },
        query:
          'id type governmentBudgetResult budgetCategoryResult budgetAmountResult budgetTypeResult reductionAmountResult freezeAmountResult reason proposers coSigners',
      })

      const norm = (v?: string | null) => (v ? String(v).trim() : '')
      const isSame = (a: any, b: any) =>
        norm(a.type) === norm(b.type) &&
        norm(a.governmentBudgetResult) === norm(b.governmentBudgetResult) &&
        norm(a.budgetCategoryResult) === norm(b.budgetCategoryResult) &&
        norm(a.budgetAmountResult) === norm(b.budgetAmountResult) &&
        norm(a.budgetTypeResult) === norm(b.budgetTypeResult) &&
        norm(a.reductionAmountResult) === norm(b.reductionAmountResult) &&
        norm(a.freezeAmountResult) === norm(b.freezeAmountResult) &&
        norm(a.reason) === norm(b.reason) &&
        norm(a.proposers) === norm(b.proposers) &&
        norm(a.coSigners) === norm(b.coSigners)

      const hasSameBefore = prevList.some((p) => isSame(p, current))
      if (!hasSameBefore) return

      // 將相同 imageUrl 的 RecognitionImage 設為 verified
      const images = await context.query.RecognitionImage.findMany({
        where: { imageUrl: { equals: String(imageUrl) } },
        query: 'id verificationStatus',
        take: 1,
      })
      const target = images[0]
      if (!target || target.verificationStatus === 'verified') return

      await context.query.RecognitionImage.updateOne({
        where: { id: String(target.id) },
        data: { verificationStatus: 'verified' },
        query: 'id',
      })

      // 同步建立 Proposal（draft），每次直接建立新的
      const image = await context.query.RecognitionImage.findOne({
        where: { id: String(imageId) },
        query:
          'id imageUrl meeting { id } government { id } mergedProposals { id } historicalProposals { id } result',
      })

      // 不查重，直接建立

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
      if (current?.governmentBudgetResult)
        lines.push(`辨識結果-部會預算：${current.governmentBudgetResult}`)
      if (current?.budgetCategoryResult)
        lines.push(`辨識結果-預算科目：${current.budgetCategoryResult}`)
      if (current?.budgetAmountResult)
        lines.push(`辨識結果-預算金額：${current.budgetAmountResult}`)
      if (current?.proposers)
        lines.push(`提案人：${names(current.proposers)}`)
      if (current?.coSigners)
        lines.push(`連署人：${names(current.coSigners)}`)

      const data: Record<string, any> = {
        publishStatus: 'draft',
        recognitionAnswer: lines.join('\n'),
        proposalTypes: mapProposalType(current?.budgetTypeResult),
        reductionAmount: toNumber(current?.reductionAmountResult),
        freezeAmount: toNumber(current?.freezeAmountResult),
        reason: current?.reason || undefined,
        budgetImageUrl: image?.imageUrl || undefined,
      }

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

      await context.query.Proposal.createOne({ data, query: 'id' })
    },
  },

  ui: {
    listView: {
      initialColumns: ['image', 'type', 'governmentBudgetResult', 'budgetAmountResult'],
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
