import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { select, checkbox, relationship, json, timestamp, text } from '@keystone-6/core/fields';
	  
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
      label: '候選人政見',
      many: false,
      ref: 'Politic',
    }),
    progress: select({
      defaultValue: 'active', 
      options: [ 
        { label: '還沒開始', value: 'no-progress' }, 
        { label: '進行中', value: 'in-progress' }, 
        { label: '卡關中', value: 'in-trouble' },
      ], 
      label: '狀態',
    }),
    source: text({ 
	  label: '資料來源',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    contributer: text({ label: '資料提供' }),
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
