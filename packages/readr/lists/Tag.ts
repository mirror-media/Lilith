import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {relationship,checkbox,select,text} from '@keystone-6/core/fields';
	  
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
      isIndexed: 'unique', 
      label: '標籤名稱', 
      validation: { isRequired: true} 
    }),
    brief: text({
      label: '前言',  
      ui: { displayMode: 'textarea' } 
    }),
    heroVideo: relationship({
      ref: 'Video', label: 'Leading Video' 
    }),
    state: select({
      defaultValue: 'active', 
      options: [ 
        { label: 'inactive', value: 'inactive' }, 
        { label: 'active', value: 'active' }, 
        { label: 'archived', value: 'archived' }
      ], 
      label: '狀態',
    }),
    ogTitle: text({
      validation: { isRequired: false}, 
      label: 'FB分享標題' 
    }),
    ogDescription: text({
      validation: { isRequired: false}, 
      label: 'FB分享說明',  
    }),
    ogImage: relationship({
      ref: 'Photo',
      label: 'FB分享縮圖' 
    }),
    isFeatured: checkbox({
      label: '置頂', isIndexed: true 
    }),
    posts: relationship({
      ref: 'Post.tags',
      many: true,
      label: '相關文章',
    }),
    projects: relationship({
      ref: 'Project.tags',
      many: true,
      label: '相關專題',
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
