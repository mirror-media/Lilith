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
      label: '名稱', validation: { isRequired: true} 
    }),
    title: text({
      label: '中文名稱', 
      validation: { isRequired: true} 
    }),
    isFeatured: checkbox({
      isIndexed: true, 
      label: '置頂',  
    }),
    style: select({
      options: [ 
        { label: 'feature', value: 'feature' }, 
        { label: 'listing', value: 'listing' }, 
        { label: 'tile', value: 'tile' }],  
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
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
      label: 'FB分享縮圖',  
      ref: 'Photo',
    }),
    css: text({
      label: 'CSS', 
      ui: { displayMode: 'textarea' } 
    }),
    javascript: text({
      label: 'javascript', 
      ui: { displayMode: 'textarea' } 
    }),
    isCampaign: checkbox({
      label: '活動分類', 
      isIndexed: true 
    }),
    isMemberOnly: checkbox({
      label: '會員專區', 
      isIndexed: false 
    }),
    isAudioSiteOnly: checkbox({
       label: '僅用於語音網站', isIndexed: true 
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
