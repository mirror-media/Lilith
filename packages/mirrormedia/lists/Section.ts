import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {text,select,checkbox,relationship} from '@keystone-6/core/fields';
	  
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
      validation: { isRequired: true}, label: '名稱' 
    }),
    title: text({
 	  label: '中文名稱', validation: { isRequired: true} 
    }),
    description: text({
       label: '簡介',  
    }),
    //categories: relationship({
 	//  label: '分類', many: 'true', ref: 'PostCategory' 
    //}),
    //extend_cats: relationship({
 	//  label: '其他分類', many: 'true', ref: 'PostCategory' 
    //}),
    heroImage: relationship({
	  ref: 'Photo',
      label: '首圖',  
    }),
    isFeatured: checkbox({
       label: '置頂',  
    }),
    style: select({
      options: [ 
	    { label: 'feature', value: 'feature' }, 
		{ label: 'listing', value: 'listing' }, 
		{ label: 'tile', value: 'tile' }, 
		{ label: 'full', value: 'full' }, 
		{ label: 'video', value: 'video' }, 
		{ label: 'light', value: 'light' }
	  ],  
    }),
    og_title: text({
 	  label: 'FB分享標題', 
	  validation: { isRequired: false} 
    }),
    og_description: text({
      validation: { isRequired: false}, label: 'FB分享說明',  
    }),
    og_image: relationship({
	  ref: 'Photo',
      label: 'FB分享縮圖',  
    }),
    isMemberOnly: checkbox({
      label: '會員專區', 
	  isIndexed: false 
    }),
    timeline: text({
 	  label: 'Twitter 帳號' 
    }),
    topics: relationship({
 	  label: '專題',
	  many: true, 
	  ref: 'Topic' 
    }),
    css: text({
      ui: { displayMode: 'textarea' }, 
	  label: 'CSS' 
    }),
    javascript: text({
      label: 'javascript', 
	  ui: { displayMode: 'textarea' } 
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
