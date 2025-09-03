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
    freezeReduceAmountResult: text({
      label: '辨識結果-凍結/刪減金額',
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
