import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {relationship,select} from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
	choices: relationship({
      ref: 'Post', 
      many: 'false', 
      label: '精選文章' 
    }),
    state: select({
      defaultValue: 'draft', 
      options: [ 
        {label: 'draft', value: 'draft'}, 
        {label: 'published', value: 'published'}, 
        {label: 'scheduled', value: 'scheduled'}, 
        {label: 'archived', value: 'archived'}, 
        {label: 'invisible', value: 'invisible'}
      ], 
      isIndexed: true, 
      label: '狀態' 
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
