import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { timestamp, text, select, checkbox, relationship } from '@keystone-6/core/fields';

const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      isIndexed: true,
      validation: { isRequired: true }
    }),
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: { isRequired: true }
    }),
    state: select({
      options: [
        { label: '過往活動', value: 'now' },
        { label: '即將舉辦（舉辦中）', value: 'past' },
      ],
      label: '狀態',
      defaultValue: 'now',
      isIndexed: true
    }),
    publishedDate: timestamp({
      label: '發佈日期',
      isIndexed: true
    }),
    sections: relationship({
      label: '大分類',
      ref: 'Section',
      many: true,
    }),
    eventType: select({
      options: [
        { label: 'logo', value: 'logo' },
        { label: 'mod', value: 'mod' },
        { label: 'embedded', value: 'embedded' },
      ],
      isIndexed: true,
    }),
    startDate: timestamp({
      validation: { isRequired: true }
    }),
    endDate: timestamp(),
    heroImage: relationship({
      ref: 'Photo',
      label: 'image 活動首圖'
    }),
    link: text({
      label: '連結',
    }),
    isFeatured: checkbox({
      label: '置頂（呈現於列表頁）',
      defaultValue: false,
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
