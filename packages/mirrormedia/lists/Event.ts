import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {timestamp,text,select,checkbox,relationship} from '@keystone-6/core/fields';
	  
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
      validation: { isRequired: true} 
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
    publishedDate: timestamp({
       label: '發佈日期', 
      isIndexed: true
    }),
    sections: relationship({
      ref: 'Section', 
      many: true, 
      label: '分區',  
    }),
    eventType: select({
      options: [ 
        { label: 'logo', value: 'logo' }, 
        { label: 'mod', value: 'mod' }, 
      ], 
      isIndexed: true,  
    }),
    startDate: timestamp({
      validation: { isRequired: true} 
    }),
    endDate: timestamp({
    }),
    video: relationship({
      ref: 'Video', 
      label: 'Video',  
      many: false,
    }),
    embed: text({
      label: 'Embedded code' 
    }),
    image: relationship({
      ref: 'Photo', 
      label: 'Image' 
    }),
    link: text({
       label: '連結',  
    }),
    isFeatured: checkbox({
       isIndexed: true, label: '置頂',  
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
