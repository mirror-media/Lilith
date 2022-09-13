import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { relationship, select, integer, timestamp } from '@keystone-6/core/fields';

const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    order: integer({
      label: '排序',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    choices: relationship({
      label: '精選文章',
      ref: 'Post',
      many: false,
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: 'draft' }, 
        { label: '已發布', value: 'published' },
        { label: '預約發佈', value: 'scheduled' },
        { label: '下線', value: 'archived' },
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
