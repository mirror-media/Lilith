import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { select, relationship, json, timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    person: relationship({
      label: '候選人',
      many: false,
      ref: 'PersonElection',
    }),
    desc: text({ 
	  label: '政見', 
	}),
    source: text({ label: '資料來源' }),
    contributer: text({ label: '資料提供' }),
    progress: relationship({
      label: '選舉',
      many: true,
      ref: 'PoliticProgress',
    }),
	status: select({
	  options: [
	    { label: '已確認', value: 'verified' },
	    { label: '未確認', value: 'notverified' },
	  ],
	  label: '狀態',
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
