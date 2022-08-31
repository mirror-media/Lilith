import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {timestamp, integer, text, relationship} from '@keystone-6/core/fields';
	  
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
	  isRequired: true }),
    role: text({ label: '職稱' }),
    member: relationship({ 
	  label: '成員', 
	  many: false, 
	  ref: 'Person' }),
    organization: relationship({
      label: '組織',
      many: false,
      ref: 'Organization',
    }),
    posts: relationship({ 
	  label: '職稱', 
	  many: false, 
	  ref: 'Post' 
	}),
    on_behalf_of_id: text({ label: 'on_behalf_of_id' }),
    area: relationship({ 
	  label: '地區', 
	  many: false, 
	  ref: 'Area' 
	}),
    start_date: timestamp({ label: '起始日期' }),
    end_date: timestamp({ label: '結束日期' }),
    // contact_details: { label: "contact_details", type: Relationship, many: false, ref: 'Contact_detail' },
    links: text({ label: '相關連結' }),
    // identifiers: { label: "identifiers", type: Relationship, many: false, ref: 'User',  isRequired: true},
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
