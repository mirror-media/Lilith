import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { integer, relationship, timestamp, text } from '@keystone-6/core/fields';
	  
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
      many: true,
      ref: 'Politic.timeline',
    }),
    eventDate: timestamp({
      label: '日期',
    }),
    sortOrder: integer({
      label: '排序',
    }),
    content: text({ 
	  label: '文字',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    link: text({ 
	  label: '連結',
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
