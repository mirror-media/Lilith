import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {timestamp, integer, text, select, checkbox, relationship} from '@keystone-6/core/fields';
	  
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
      isIndexed: true, 
	  label: '標題',
      validation: { isRequired: true} 
    }),
	sortOrder: integer({
	  label: '排列順序',
	}),
    state: select({
      options: [ 
        { label: 'draft', value: 'draft' }, 
        { label: 'scheduled', value: 'scheduled' }, 
        { label: 'published', value: 'published' }
      ], 
      label: '狀態', 
      defaultValue: 'draft', 
      isIndexed: true 
    }),
	byline: text({
	  label: '引自',
	}),
	writer: relationship({
	  ref: 'Author.quote',
	  many: false,
	  label: '相關作者',
	}),
    publishTime: timestamp({
       label: '發佈日期', 
      isIndexed: true
    }),
    link: text({
       label: '連結',  
    }),

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
