import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { select, text, timestamp, relationship } from '@keystone-6/core/fields';

const {
   allowRoles,
   admin,
   moderator,
   editor,
   owner,
} = utils.accessControl

const listConfigurations = list({
   fields: {
      slug: text({
         label: 'slug',
         isIndexed: 'unique',
         validation: { isRequired: true }
      }),
      partner: relationship({
         ref: 'Partner',
         ui: {
            hideCreate: true,
         }
      }),
      state: select({
         label: '狀態',
         options: [
            { label: '草稿', value: 'draft' },
            { label: '已發布', value: 'published' },
            { label: '預約發佈', value: 'scheduled' },
            { label: '下線', value: 'archived' },
            { label: '前台不可見', value: 'invisible' }
         ],
         defaultValue: 'draft',
         isIndexed: true
      }),
      publishedDate: timestamp({
         label: '發佈日期',
         isIndexed: true
      }),
      extend_byline: text({
         label: '作者',
         validation: { isRequired: false }, 
      }),
      thumb: text({
         label: '圖片網址', 
         validation: { isRequired: false }
      }),

      brief: text({
         label: '前言',
         ui: { displayMode: 'textarea' }, 
      }),
      content: text({
         label: '內文', 
         ui: { displayMode: 'textarea' },
      }),
      source: text({
         label: '原文網址', 
         validation: { isRequired: false },
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
