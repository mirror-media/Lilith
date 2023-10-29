import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { checkbox, select, relationship, timestamp, text } from '@keystone-6/core/fields';
	  
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
      ref: 'Politic.positionChange',
    }),
    factcheckPartner: relationship({
      label: '查核單位',
      many: false,
      ref: 'FactcheckPartner.positionChange',
    }),
    checkDate: timestamp({
      label: '日期',
	  validation: { isRequired: true },
    }),
    positionChangeSummary: text({
      label: '立場變化（摘要）',
	  validation: { isRequired: true },
	  defaultValue: '',
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
    isChanged: select({
      defaultValue: 'same', 
      options: [ 
        { label: '曾持相同意見', value: 'same' }, 
        { label: '曾持不同意見', value: 'changed' }, 
        { label: '當時未表態', value: 'noComment' },
      ], 
      label: '立場改變',
	  validation: { isRequired: true },
	  isIndexed: true,
    }),
    link: text({ 
	  label: '相關連結',
	  validation: { isRequired: true },
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    editingPolitic: relationship({
      label: '政見',
      many: true,
      ref: 'EditingPolitic.positionChange',
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
