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
      many: false,
      ref: 'Politic.factCheck',
    }),
    checkDate: timestamp({
      label: '日期',
    }),
    content: text({ 
	  label: '查核內容',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
	checkResultType: select({
	  options: [
	    { label: '正確資訊', value: 'correct' },
	    { label: '不正確資訊', value: 'incorrect' },
	    { label: '片面資訊', value: 'partial' },
	  ],
	  defaultValue: 'correct',
	  label: '查核結果',
	}),
    link: text({ 
	  label: '相關連結',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    factcheckPartner: relationship({
      label: '查核單位',
      many: false,
      ref: 'FactcheckPartner.factCheck',
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
