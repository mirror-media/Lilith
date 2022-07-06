import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  timestamp,
  select,
} from '@keystone-6/core/fields';

const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    member: relationship({ ref: 'Member', many: false }),
    collection: relationship({ ref: 'Collection', many: false }),
    added_by: relationship({  
	  ref: 'Member.create_collection',
	  many: false,
	}),
    updated_by: relationship({  
	  ref: 'Member.modify_collection',
	  many: false,
	}),
	role: select({
	  label: '類型',
	  datatype: 'enum',
	  options: [
		{ label: '管理員', value: 'admin' },
		{	label: '協作者', value: 'collaborator' },
	  ]
	}),
	added_date: timestamp({ validation: { isRequired: false} }),
	updated_date: timestamp({ validation: { isRequired: false} }),
  },
  ui: {
    listView: {
      initialColumns: ['member', 'story'],
    },
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
