import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';

import {
  text,
  relationship,
  password,
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
      title: text({ validation: { isRequired: false } }),
      slug: text({ validation: { isUnique:true, isRequired: true } }),
      summary: text({ validation: { isRequired: false } }),
	  public: select({
		label: '類型',
	 	datatype: 'enum',
		options: [
		  { label: '個人', value: 'private' },
		  {	label: '公開', value: 'public' },
		  {	label: '共筆', value: 'wiki' },
		]
	  }),
      status: select({
        label: '狀態',
        datatype: 'enum',
        options: [
          { label: 'publish', value: 'publish' },
          { label: 'draft', value: 'draft' },
          { label: 'delete', value: 'delete' },
        ],
      }),
	  format: select({
		label: '型態',
	 	datatype: 'enum',
		options: [
		  { label: '資料夾', value: 'folder' },
		  {	label: '時間軸', value: 'timeline' },
		]
	  }),
	  heroImage: relationship({
		label: '首圖',
		ref: 'Photo',
	  }),
	  collectionpicks: relationship({
		ref: 'CollectionPick.collection',
		many: true,
	  }),
	  picks: relationship({ ref: 'Pick.collection', many: true }),
      comment: relationship({ ref: 'Comment.collection', many: true }),
      creator: relationship({  
	  	ref: 'Member',
		many: false,
	  }),
    },
    ui: {
      listView: {
        initialColumns: ['title', 'slug'],
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
