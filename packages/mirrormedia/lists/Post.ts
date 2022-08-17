import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {checkbox,relationship,timestamp,text,select} from '@keystone-6/core/fields';
	  
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
      label: '網址名稱（英文）', 
      isIndexed: 'unique' 
    }),
    title: text({
      label: '標題', 
      validation: { isRequired: true} 
    }),
    subtitle: text({
      label: '副標', 
      validation: { isRequired: false} 
    }),
    state: select({
      label: '狀態', 
      options: [ 
        { label: 'draft', value: 'draft' },        { label: 'published', value: 'published' }, 
        { label: 'scheduled', value: 'scheduled' }, 
        { label: 'archived', value: 'archived' }, 
        { label: 'invisible', value: 'invisible' }
      ], 
      defaultValue: 'draft', 
      isIndexed: true 
    }),
    publishedDate: timestamp({
      isIndexed: true, 
      label: '發佈日期',  
    }),
    sections: relationship({
      label: '分區', 
      many: true, 
      ref: 'Section' 
    }),
    categories: relationship({
      ref: 'PostCategory', 
      label: '分類', 
      many: true 
    }),
    writers: relationship({
      ref: 'Contact', 
      many: true, 
      label: '作者' 
    }),
    photographers: relationship({
      many: true, 
      label: '攝影', 
      ref: 'Contact' 
    }),
    camera_man: relationship({
      label: '影音', 
      many: true, 
      ref: 'Contact' 
    }),
    designers: relationship({
      label: '設計', 
      many: true, 
      ref: 'Contact' 
    }),
    engineers: relationship({
      many: true, 
      label: '工程', 
      ref: 'Contact' 
    }),
    vocals: relationship({
      ref: 'Contact', 
      label: '主播', 
      many: true 
    }),
    extend_byline: text({
      validation: { isRequired: false}, 
      label: '作者（其他）' 
    }),
    heroVideo: relationship({
      label: 'Leading Video',
      ref: 'Video',
    }),
    heroImage: relationship({
       label: '首圖',  
       ref: 'Photo',
    }),
    heroCaption: text({
      label: '首圖圖說', 
      validation: { isRequired: false} 
    }),
    heroImageSize: select({
      label: '首圖尺寸', 
      options: [ 
        { label: 'extend', value: 'extend' }, 
        { label: 'normal', value: 'normal' }, 
        { label: 'small', value: 'small' }
      ], 
      defaultValue: 'normal' 
    }),
    style: select({
      isIndexed: true, 
      defaultValue: 'article', 
      options: [ 
        { label: 'article', value: 'article' }, 
        { label: 'wide', value: 'wide' }, 
        { label: 'projects', value: 'projects' }, 
        { label: 'photography', value: 'photography' }, 
        { label: 'script', value: 'script' }, 
        { label: 'campaign', value: 'campaign' }, 
        { label: 'readr', value: 'readr' }
      ], 
      label: '文章樣式',  
    }),
    brief: text({
       label: '前言',  
    }),
    content: customFields.richTextEditor({
       label: '內文', 
    }),
    topics: relationship({
      label: '專題',  
      ref: 'Topic',
    }),
    tags: relationship({
      ref: 'Tag', 
      many: true, 
      label: '標籤' 
    }),
    titleColor: select({
      options: [ 
        { label: 'light', value: 'light' }, 
        { label: 'dark', value: 'dark' }], 
      label: '標題模式',  
    }),
    relateds: relationship({
      ref: 'Post', 
      many: true, 
      label: '相關文章',  
    }),
    og_title: text({
      validation: { isRequired: false}, 
      label: 'FB分享標題' 
    }),
    og_description: text({
      label: 'FB分享說明', 
      validation: { isRequired: false} 
    }),
    og_image: relationship({
      label: 'FB分享縮圖',  
      ref: 'Photo',
    }),
    isFeatured: checkbox({
      label: '置頂', 
      isIndexed: true 
    }),
    isAdvertised: checkbox({
      label: '廣告文案', 
      isIndexed: true 
    }),
    hiddenAdvertised: checkbox({
      label: 'google廣告違規', 
      defaultValue: false 
    }),
    isCampaign: checkbox({
      isIndexed: true, 
      label: '活動' 
    }),
    isAdult: checkbox({
      isIndexed: true, label: '18禁',  
    }),
    lockJS: checkbox({
      isIndexed: true, label: '鎖定右鍵',  
    }),
    isAudioSiteOnly: checkbox({
      label: '僅用於語音網站', 
      isIndexed: true 
    }),
    device: select({
      label: '裝置', 
      defaultValue: 'all', 
      isIndexed: true, 
      options: [ 
        { label: 'all', value: 'all' }, 
        { label: 'web', value: 'web' }, 
        { label: 'app', value: 'app' }
      ] 
    }),
    css: text({
      ui: { displayMode: 'textarea' }, 
      label: 'CSS' 
    }),
    adTrace: text({
      label: '追蹤代碼', 
      ui: { displayMode: 'textarea' } 
    }),
    redirect: text({
      validation: { isRequired: false}, 
      label: '廣編文轉址 slug' 
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
