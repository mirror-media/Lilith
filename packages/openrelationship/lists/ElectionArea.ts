import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { relationship, integer, select, text } from '@keystone-6/core/fields';
	  
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
	  label: '選舉區',
	  isRequired: true 
	}),
	type: text({ label: '選舉類型' }),
    description: text({ label: '敘述' }),
    status: select({ 
	  label: '狀態',
	  options: [
		{ value: 'active', label: '有效' },
		{ value: 'deactive', label: '失效' },
	  ],
	defaultValue: 'active',
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
