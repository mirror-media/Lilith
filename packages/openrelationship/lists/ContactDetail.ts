import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    label: text({ 
	  label: '名稱', 
	  isrequired: true,
	}),
    type: text({ 
	  label: 'type'
	}),
    value: text({ label: '值' }),
    valid_from: timestamp({ label: '有效起始時間' }),
    valid_until: timestamp({ label: '有效截止時間' }),
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
