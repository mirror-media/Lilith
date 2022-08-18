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
	    name: text({
       validation: { isRequired: true}, isIndexed: 'unique', label: '網址名稱（英文）' 
    }),
    partner: relationship({
       initial: 'true', ref: 'Partner', isIndexed: true 
    }),
    title: text({
       validation: { isRequired: true}, label: '標題' 
    }),
    subtitle: text({
       validation: { isRequired: false}, label: '副標',  
    }),
    state: select({
       isIndexed: true, defaultValue: 'draft', label: '狀態', options: [ { label: 'draft', value: 'draft' }, { label: 'published', value: 'published' }, { label: 'scheduled', value: 'scheduled' }, { label: 'archived', value: 'archived' }, { label: 'invisible', value: 'invisible' }] 
    }),
    publishedDate: timestamp({
 label: '發佈日期', isIndexed: true
    }),
    extend_byline: text({
       validation: { isRequired: false}, label: '作者',  
    }),
    thumb: text({
       label: '小圖網址', validation: { isRequired: false} 
    }),
    brief: text({
       height: '150', ui: { displayMode: 'textarea' }, label: '前言' 
    }),
    content: text({
       height: '400', label: '內文', ui: { displayMode: 'textarea' } 
    }),
    source: text({
       label: '原文網址', validation: { isRequired: false} 
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
