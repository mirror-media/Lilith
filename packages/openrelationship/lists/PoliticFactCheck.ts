import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { select, relationship, timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    politic: relationship({
      label: '政見',
      many: true,
      ref: 'Politic.factCheck',
    }),
    factCheckSummary: text({
      label: '事實查核（摘要）',
	  defaultValue: '',
	  validation: {
		isRequired: true,
		length: {
		  max: 15,
		},
	  },
	  ui: {
		displayMode: 'textarea',
	  },
    }),
    content: text({ 
	  label: '查核內容',
	  validation: { isRequired: true },
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
	checkResultType: select({
	  options: [
	    { label: '與所查資料相符', value: "1" },
	    { label: '數據符合，但推論錯誤', value: "2" },
	    { label: '數據符合，但與推論無關', value: "3" },
	    { label: '數據符合，但僅取片段資訊，無法瞭解全貌', value: "4" },
	    { label: '片面事實，有一些前提或關鍵事實被隱藏', value: "5" },
	    { label: '與所查資料不符合，且推論過於簡化', value: "6" },
	    { label: '不知道數據出處為何', value: "7" },
	    { label: '數據並非例行統計，今年才發布', value: "8" },
	    { label: '其說法並沒有提出證據', value: "9" },
	    { label: '其他結果（請於下方欄位填寫）', value: "10" },
	  ],
	  defaultValue: "1",
	  label: '查核結果',
	  validation: {
		length: {
		  max: 15,
		},
	  },
	}),
	checkResultOther: text({
	  label: '查核結果（其他）',
	}),
    link: text({ 
	  label: '相關連結',
	  validation: { isRequired: true },
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    factcheckPartner: relationship({
      label: '查核單位',
      many: false,
      ref: 'FactcheckPartner.factCheck',
    }),
    editingPolitic: relationship({
      label: '政見',
      many: true,
      ref: 'EditingPolitic.factCheck',
    }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
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
