import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
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
    label: text({ 
	  label: '名稱',
	  isRequired: true }),
    other_label: text({ label: '其他名稱' }),
    role: text({ label: 'role' }),
    organization: relationship({
      label: '組織',
      many: false,
      ref: 'Organization',
    }),
    area: relationship({ 
	  label: '地區', 
	  many: false, 
	  ref: 'Area' }),
    start_date: timestamp({ label: '起始日期' }),
    end_date: timestamp({ label: '結束日期' }),
    // contact_details: { label: "聯絡人", type: Relationship, many: false, ref: 'Contact_detail' },
    links: text({ label: '相關連結' }),
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
