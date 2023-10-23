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
      many: true,
      ref: 'Politic.controversies',
    }),
    content: text({ 
	  label: '爭議內容',
	  validation: { isRequired: true },
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    factcheckPartner: relationship({
      label: '查核單位',
      many: false,
      ref: 'FactcheckPartner.controversies',
    }),
    link: text({ 
	  label: '相關連結',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    editingPolitic: relationship({
      label: '政見（待審核）',
      many: true,
      ref: 'EditingPolitic.controversies',
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
