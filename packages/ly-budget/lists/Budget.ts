import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { float, text, select, integer, relationship } from '@keystone-6/core/fields'
import { gqlReadOnly } from '../access'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const typeOptions = [
  { value: 'budget', label: '預算' },
  { value: 'legal_budget', label: '法定預算' },
]

const listConfigurations = list({
  fields: {
    government: relationship({
      label: '部會',
      ref: 'Government',
    }),
    type: select({
      label: '類型',
      options: typeOptions,
      validation: { isRequired: true },
    }),
    year: integer({
      label: '年度',
      validation: { isRequired: true },
    }),
    majorCategory: text({
      label: '大科目名稱',
      validation: { isRequired: true },
    }),
    mediumCategory: text({
      label: '中科目名稱',
      validation: { isRequired: true },
    }),
    minorCategory: text({
      label: '小科目名稱',
      validation: { isRequired: true },
    }),
    projectName: text({
      label: '計畫名稱',
      db: {
        isNullable: true,
      },
    }),
    projectDescription: text({
      label: '計畫說明',
      db: {
        isNullable: true,
      },
      ui: {
        displayMode: 'textarea',
      },
    }),
    budgetAmount: float({
      label: '編列金額',
      validation: { 
		max: 9999999999999,
		isRequired: true 
	  },
    }),
    lastYearSettlement: float({
      label: '上年度決算',
      db: {
		max: 9999999999999,
        isNullable: true,
      },
    }),
    budgetUrl: text({
      label: '預算書網址',
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
      initialColumns: ['government', 'year', 'type', 'majorCategory', 'budgetAmount'],
    },
  },
  access: {
    operation: gqlReadOnly(),
  },
})

export default listConfigurations
