import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  timestamp,
  select,
  checkbox,
} from '@keystone-6/core/fields';

const  {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    member: relationship({ ref: 'Member.pick', many: false }),
	objective: select({
	  label: '類型',
	  datatype: 'enum',
	  options: [
		{ label: '新聞', value: 'story' },
		{	label: '專題', value: 'collection' },
		{	label: '留言', value: 'comment' },
      ]
	}),
    story: relationship({ ref: 'Story.pick', many: false }),
    collection: relationship({ ref: 'Collection.picks', many: false }),
    comment: relationship({ ref: 'Comment', many: false}),
    pick_comment: relationship({ ref: 'Comment', many: true }),
	//posts: relationship({ ref: 'Post.author', many: true }),
	kind: select({
	  label: '型態',
	  datatype: 'enum',
	  options: [ 
	    { label: '收藏', value: 'collect' }, 
		{ label: '閱讀', value: 'read' },
		{ label: '書籤', value: 'bookmark' }
      ],
	  defaultValue: 'read',
	}),
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
	picked_date: timestamp({ validation: { isRequired: false} }),
    paywall: checkbox({
      defaultValue: false,
    }),
    is_active: checkbox({
      defaultValue: true,
    }),
    //tag: relationship({ ref: 'Tag', many: false }),
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
