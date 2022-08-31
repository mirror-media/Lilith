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
    option: text({ 
	  label: '選項', 
	  isrequired: true,
	}),
    value: text({ 
	  label: '值'
	}),
    group: text({ label: 'group' }),
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
