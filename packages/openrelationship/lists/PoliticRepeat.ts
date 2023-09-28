import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { checkbox, relationship, timestamp, text } from '@keystone-6/core/fields';
	  
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
      many: false,
      ref: 'Politic.repeat',
    }),
    checkDate: timestamp({
      label: '日期',
    }),
    repeatSummary: text({
      label: '重複政見（摘要）',
	  isRequired: true,
	  defaultValue: '',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
    content: text({ 
	  label: '重複內容',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
	checkResultType: checkbox({
	  label: '是否為重複政見',
	}),
    factcheckPartner: relationship({
      label: '查核單位',
      many: false,
      ref: 'FactcheckPartner.repeat',
    }),
    link: text({ 
	  label: '相關連結',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    contributer: text({ 
	  label: '資料提供',
	  ui: {
		displayMode: 'textarea',
	  },
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
