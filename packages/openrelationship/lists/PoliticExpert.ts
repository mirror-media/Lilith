import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { relationship, timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    politic: relationship({
      label: '政見',
      many: false,
      ref: 'Politic.expertPoint',
    }),
    expert: text({ 
	  label: '專家姓名',
	  db: {
	    isNullable: true,
	  }
	}),
    avatar: text({ 
	  label: '頭像連結',
	}),
    title: text({ 
	  label: '職稱',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    reviewDate: timestamp({
      label: '日期',
    }),
    content: text({ 
	  label: '意見內容',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    link: text({ 
	  label: '連結',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    contributer: text({ label: '資料提供' }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
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
