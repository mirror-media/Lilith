import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  integer,
  checkbox,
  json,
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
    url: text({ 
		validation: { isRequired: true },
		isIndexed: 'unique',
	}),
    summary: text({ 
	  validation: { isRequired: false },
	  ui: { displayMode: 'textarea' },
	}),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
  }),
    content: text({ 
	  validation: { isRequired: false }, 
	  ui: { displayMode: 'textarea' },
	}),
    writer: text({ 
	  validation: { isRequired: false }, 
	}),
	source: relationship({ ref: 'Publisher', many: false }),
	author: relationship({ ref: 'Member', many: false }),
	category: relationship({ ref: 'Category', many: false }),
	pick: relationship({ ref: 'Pick.story', many: true }),
	comment: relationship({ ref: 'Comment.story', many: true }),
	related: relationship({ ref: 'Story', many: true }),
    published_date: timestamp({ validation: { isRequired: false } }),
    og_title: text({ validation: { isRequired: false } }),
    og_image: text({ validation: { isRequired: false } }),
    og_description: text({ validation: { isRequired: false } }),
	full_content: checkbox({
	  defaultValue: false,
	}),
    paywall: checkbox({
      defaultValue: false,
    }),
	origid: text({}),
	full_screen_ad: select({
	  label: '蓋板',
	  datatype: 'enum',
	  options: [ 
		{ label: '手機', value: 'mobile' }, 
		{ label: '桌機', value: 'desktop' },
		{ label: '所有尺寸', value: 'all' },
		{ label: '無', value: 'none' }
	  ],
	  defaultValue: 'none',
	}),
    is_active: checkbox({
      defaultValue: true,
    }),
    tag: relationship({ ref: 'Tag', many: true}),
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
