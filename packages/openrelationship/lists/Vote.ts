import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { checkbox, relationship, json, timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    vote_event: text({ 
	  label: '選舉活動', 
	  isRequired: true }),
    voter: text({ label: 'voter' }),
    option: text({ label: '選項' }),
    group: text({ label: '群組' }),
    role: text({ label: 'role' }),
    weight: text({ label: 'weight' }),
    pair: relationship({ 
	  label: '搭檔', 
	  many: false, 
	  ref: 'Person' 
	}),
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
