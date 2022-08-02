import { list } from '@keystone-6/core'
import { customFields, utils } from '@mirrormedia/lilith-core'
import {
  relationship,
  timestamp,
  select,
  integer,
} from '@keystone-6/core/fields'
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    member: relationship({ ref: 'Member', many: false }),
    type: select({
      label: '類型',
      datatype: 'enum',
      options: [
        { label: '留言', value: 'comment' },
        { label: '追蹤', value: 'follow' },
        { label: '愛心', value: 'heart' },
        { label: '對集錦按讚', value: 'collection' },
        { label: '回覆', value: 'reply' },
        { label: '精選', value: 'pick' },
        { label: '新增集錦', value: 'create_collection' },
      ],
    }),
    sender: relationship({ ref: 'Member', many: false }),
    objective: select({
      label: '目標物件',
      datatype: 'enum',
      options: [
        { label: 'member', value: 'member' },
        { label: '集錦', value: 'collection' },
        { label: '新聞', value: 'story' },
        { label: '留言', value: 'comment' },
        { label: '公告', value: 'announcement' },
      ],
    }),
    object_id: integer(),
    state: select({
      label: '狀態',
      datatype: 'enum',
      options: [
        { label: '已讀', value: 'read' },
        { label: '未讀', value: 'unread' },
      ],
      defaultValue: 'public',
    }),
    action_date: timestamp({ validation: { isRequired: false } }),
    //tag: relationship({ ref: 'Tag', many: false }),
  },
  ui: {
    listView: {
      initialColumns: ['member', 'type', 'sender'],
    },
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
