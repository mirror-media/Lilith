import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { checkbox, relationship, json, timestamp, text } from '@keystone-6/core/fields';
	  
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
      label: '候選人政見',
      many: false,
      ref: 'Politic',
    }),
    content: customFields.richTextEditor({
      label: '爭議事件',
	  disabledButtons: ['image', 'code', 'blockquote', 'code-block', 'annotation', 'font-color', 'slideshow' ],
    }),
    expert: customFields.richTextEditor({
      label: '專家看點',
	  disabledButtons: ['image', 'code', 'blockquote', 'code-block', 'annotation', 'font-color', 'slideshow' ],
    }),
    progress: text({ 
	  label: '進度', 
	}),
    source: text({ 
	  label: '資料來源',
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
