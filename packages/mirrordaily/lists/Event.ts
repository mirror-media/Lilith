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
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    state: select({
      options: [
        { label: '過往活動', value: 'draft' },
        { label: '即將舉辦（舉辦中）', value: 'published' },
      ],
      label: '狀態',
      defaultValue: 'draft',
      isIndexed: true,
    }),
    publishedDate: timestamp({
      label: '發佈日期',
      isIndexed: true,
    }),
    sections: relationship({
      label: '分區',
      ref: 'Section',
      many: true,
    }),
    eventType: select({
      options: [{ label: '直播', value: 'livestreaming' }],
      isIndexed: true,
    }),
    startDate: timestamp({
      validation: { isRequired: true },
    }),
    endDate: timestamp(),
    heroImage: relationship({
      ref: 'Photo',
      label: 'image 活動首圖',
    }),
    link: text({
      label: '連結',
    }),
    isFeatured: checkbox({
      label: '置頂（呈現於列表頁）',
      defaultValue: false,
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'slug', 'state'],
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
