import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {relationship,checkbox,text,select} from '@keystone-6/core/fields';
	  
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
      validation: { isRequired: true}, 
      label: '專題名稱' 
    }),
    subtitle: text({
 	  label: '副標', validation: { isRequired: false} 
    }),
    state: select({
      isIndexed: true, 
      defaultValue: 'draft', 
      options: [ 
        { label: 'draft', value: 'draft' }, 
        { label: 'published', value: 'published' }
      ], 
      label: '狀態',  
    }),
    brief: text({
 	  label: '前言',
      ui: { displayMode: 'textarea' } 
    }),
    leading: select({
 	  label: '標頭樣式', 
      options: [ 
        { label: 'video', value: 'video' }, 
        { label: 'slideshow', value: 'slideshow' }, 
        { label: 'image', value: 'image' }
      ], 
      isIndexed: true 
    }),
    //sections: relationship({
    //   many: 'true', label: '分區', ref: 'Section' 
    //}),
    heroVideo: relationship({
      label: 'Leading Video', 
      ref: 'Video' 
    }),
    heroImage: relationship({
      ref: 'Photo', 
      label: '首圖' 
    }),
    heroImageSize: select({
      defaultValue: 'normal', 
      options: [ 
        { label: 'extend', value: 'extend' }, 
        { label: 'normal', value: 'normal' }, 
        { label: 'small', value: 'small' }
      ], 
      label: '首圖尺寸' 
    }),
    og_title: text({
      label: 'FB分享標題', 
      validation: { isRequired: false} 
    }),
    og_description: text({
      label: 'FB分享說明', 
      validation: { isRequired: false} 
    }),
    og_image: relationship({
      ref: 'Photo',
      label: 'FB分享縮圖',  
    }),
    isFeatured: checkbox({
      isIndexed: true, 
      label: '置頂' 
    }),
    title_style: select({
      label: '專題樣式', 
      options: [ 
        { label: 'feature', value: 'feature' }
      ], 
      isIndexed: true, 
         defaultValue: 'feature' 
    }),
    type: select({
      label: '型態', 
      isIndexed: true, 
      defaultValue: 'list', 
      options: [ 
        { label: 'list', value: 'list' }, 
        { label: 'timeline', value: 'timeline' }, 
        { label: 'group', value: 'group' }, 
        { label: 'portraitwall', value: 'portraitwall' }
      ] 
    }),
    source: select({
      options: [ 
        { label: 'posts', value: 'posts' }, 
        { label: 'activities', value: 'activities' }
      ], 
      label: '資料來源',  
    }),
    sort: select({
      options: [ 
        { label: 'asc', value: 'asc' }, 
        { label: 'desc', value: 'desc' }
      ], 
      label: '時間軸排序' 
    }),
    style: text({
      label: 'CSS', 
      ui: { displayMode: 'textarea' } 
    }),
    uuid: text({
      label: 'UUID', 
    }),
    tags: relationship({
      ref: 'Tag.topics', 
      label: '標籤', 
      many: true,
    }),
    posts: relationship({
      ref: 'Post.topics', 
      label: '標籤', 
      many: true,
    }),
    javascript: text({
      label: 'javascript', 
      ui: { displayMode: 'textarea' } 
    }),
    dfp: text({
      validation: { isRequired: false}, 
      label: 'DFP code' 
    }),
    mobile_dfp: text({
      validation: { isRequired: false}, 
      label: 'Mobile DFP code',  
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
