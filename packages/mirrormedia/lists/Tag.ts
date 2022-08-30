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
    heroImage: relationship({
      ref: 'Photo', label: '首圖',  
    }),
    heroImageSize: select({
      defaultValue: 'normal', 
      options: [ 
        { label: 'extend', value: 'extend' }, 
        { label: 'normal', value: 'normal' }, 
        { label: 'small', value: 'small' }
      ], 
      label: '首圖尺寸',
    }),
    og_title: text({
      validation: { isRequired: false}, 
      label: 'FB分享標題' 
    }),
    og_description: text({
      validation: { isRequired: false}, 
      label: 'FB分享說明',  
    }),
    og_image: relationship({
      ref: 'Photo',
      label: 'FB分享縮圖' 
    }),
    isFeatured: checkbox({
      label: '置頂', isIndexed: true 
    }),
    css: text({
      ui: { displayMode: 'textarea' }, 
      label: 'CSS' 
    }),
    uuid: text({
      label: 'UUID', 
    }),
    javascript: text({
      label: 'javascript', 
      ui: { displayMode: 'textarea' } 
    }),
    posts: relationship({
      ref: 'Post.tags',
      many: true
    }),
    topics: relationship({
      ref: 'Topic.tags',
      many: true
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
