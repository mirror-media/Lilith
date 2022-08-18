import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {select,text,timestamp,relationship} from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
	title: text({
      validation: { isRequired: true}, 
      label: '標題' 
    }),
    issue: text({
       initial: 'true', label: '期數', validation: { isRequired: true} 
    }),
    description: text({
      label: '敘述',
    }),
    coverPhoto: relationship({
      ref: 'Photo',
      many: false,    
    }),
    type: select({
      options: [ 
        { label: 'weekly', value: 'weekly' }, 
        { label: 'special', value: 'special' }], 
      isIndexed: true, 
      defaultValue: 'weekly', 
      label: '種類' 
    }),
    publishedDate: timestamp({
       label: '發佈日期', isIndexed: true 
    }),
    state: select({
      label: '狀態', 
      options: [ 
        { label: 'draft', value: 'draft' }, 
        { label: 'published', value: 'published' }, 
        { label: 'archived', value: 'archived' }
      ], 
      defaultValue: 'draft', 
      isIndexed: true 
    }),
    createTime: timestamp({
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
