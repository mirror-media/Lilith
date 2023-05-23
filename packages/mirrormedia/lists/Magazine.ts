import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { select, text, timestamp, relationship, file } from '@keystone-6/core/fields';

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
      label: '期數',
      isIndexed: 'unique',
      validation: { isRequired: true }
    }), 
    title: text({
      validation: { isRequired: true },
      label: '標題'
    }),
    pdfFile: file({
      label: '雜誌pdf'
    }),
    urlOriginal: text({
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    coverPhoto: relationship({
      label: '首圖',
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
      isIndexed: true,
      label: '發佈日期',
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
