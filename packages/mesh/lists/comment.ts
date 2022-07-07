import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  password,
  timestamp,
  checkbox,
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
	story: relationship({ ref: 'Story.comment', many: false }),
    collection: relationship({ ref: 'Collection.comment', many: false }),
    content: text({ validation: { isRequired: false } }),
	parent: relationship({ ref: 'Comment', many: false }),
	root: relationship({ ref: 'Comment', many: false }),
	like: relationship({ ref: 'Member.member_like', many: true }),
	state: select({
	  label: '狀態',
	  datatype: 'enum',
	  options: [ 
		{ label: '公開', value: 'public' }, 
		{ label: '私藏', value: 'private' },
		{ label: '限好友', value: 'friend' }
      ],
	 defaultValue: 'public',
	}),
    published_date: timestamp({ validation: { isRequired: false } }),
    is_edited: checkbox({
      defaultValue: false,
    }),
    is_active: checkbox({
      defaultValue: true,
    }),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'url'],
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
