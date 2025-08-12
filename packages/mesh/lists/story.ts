import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  timestamp,
  checkbox,
  json,
  virtual,
} from '@keystone-6/core/fields'
import { checkAccessToken } from '../utils/accessToken'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({ validation: { isRequired: false } }),
    url: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    summary: text({
      validation: { isRequired: false },
      ui: { displayMode: 'textarea' },
    }),
    content: text({
      validation: { isRequired: false },
      ui: { displayMode: 'textarea' },
      access: {
        read: checkAccessToken('story'),
      },
    }),
    trimContent: text({
      validation: { isRequired: false },
      ui: { displayMode: 'textarea' },
    }),
    writer: text({
      validation: { isRequired: false },
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
      access: {
        read: checkAccessToken('story'),
      },
    }),
    trimApiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    source: relationship({ ref: 'Publisher', many: false }),
    author: relationship({ ref: 'Member', many: false }),
    category: relationship({ ref: 'Category', many: false }),
    pick: relationship({ ref: 'Pick.story', many: true }),
    comment: relationship({ ref: 'Comment.story', many: true }),
    related: relationship({ ref: 'Story', many: true }),
    published_date: timestamp({ validation: { isRequired: false } }),
    og_title: text({ validation: { isRequired: false } }),
    og_image: text({ validation: { isRequired: false } }),
    // 對外相容欄位：image -> og_image
    image: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve: (item: any) => (item?.og_image ?? null),
      }),
    }),
    og_description: text({ validation: { isRequired: false } }),
    full_content: checkbox({
      defaultValue: false,
    }),
    paywall: checkbox({
      defaultValue: false,
    }),
    isMember: checkbox({
      defaultValue: false,
    }),
    origid: text({}),
    full_screen_ad: select({
      label: '蓋板',
      type: 'enum',
      options: [
        { label: '手機', value: 'mobile' },
        { label: '桌機', value: 'desktop' },
        { label: '所有尺寸', value: 'all' },
        { label: '無', value: 'none' },
      ],
      defaultValue: 'none',
    }),
    is_active: checkbox({
      defaultValue: true,
    }),
    tag: relationship({ ref: 'Tag.story', many: true }),
    story_type: select({
      label: '類型',
      type: 'enum',
      options: [
        { label: 'Story', value: 'story' },
        { label: 'Podcast', value: 'podcast' },
      ],
      defaultValue: 'story',
      isIndexed: true,
    }),
    podcast: relationship({ ref: 'Podcast', many: false }),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'url'],
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
