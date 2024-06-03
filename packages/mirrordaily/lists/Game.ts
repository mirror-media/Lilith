import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  timestamp,
  text,
  select,
  checkbox,
  relationship,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      isIndexed: true,
      validation: { isRequired: true },
    }),
    state: select({
      options: [
        { label: '草稿', value: 'draft' },
        { label: '發布', value: 'published' },
      ],
      label: '狀態',
      defaultValue: 'draft',
      isIndexed: true,
    }),
    publishedDate: timestamp({
      label: '發佈日期',
      isIndexed: true,
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
    }),
    link: text({
      label: '連結',
    }),
    isFeatured: checkbox({
      label: '置頂',
      defaultValue: false,
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'state'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
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
