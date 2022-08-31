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
    name: text({ 
	  label: '名稱',
	  isRequired: true }),
    identifiers: text({ label: 'identifiers' }),
    classification: text({ label: 'classification' }),
    parent: relationship({ 
	  label: 'parent',
	  many: false, 
	  ref: 'Area' }),
    geometry: text({ label: 'geometry' }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
    organizations: relationship({
      label: '組織',
      many: true,
      ref: 'Organization',
    }),
    posts: text({ label: 'posts' }),
    children: relationship({
      label: 'children',
      many: true,
      ref: 'Area',
    }),
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
