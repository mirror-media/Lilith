import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {timestamp, integer, text, select, checkbox, relationship} from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    name: text({ 
	  label: '你的大名', 
	}),
    email: text({ 
	  label: '你的email address'
	}),
    feedback: text({ label: '你的協作心得' }),
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
