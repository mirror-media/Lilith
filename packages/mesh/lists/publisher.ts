import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, select, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({ validation: { isRequired: false } }),
    official_site: text({ validation: { isRequired: true } }),
    rss: text({ validation: { isRequired: false } }),
    podcast_url: text({ validation: { isRequired: false } }),
    youtube_url: text({ validation: { isRequired: false } }),
    summary: text({ validation: { isRequired: false } }),
    logo: text({ validation: { isRequired: false } }),
    description: text({ validation: { isRequired: false } }),
    is_active: checkbox({
      defaultValue: true,
    }),
    customId: text({
      label: 'customId',
      validation: {
        isRequired: true,
      },
      isIndexed: 'unique',
    }),
    admin: relationship({
      label: "媒體管理員",
      ref: "Member.publisher",
      many: false,
    }),
    exchange: relationship({
      label: "點數兌換紀錄",
      ref: "Exchange.publisher",
      many: true,
    }),
    story_type: relationship({
      label: "文章種類",
      ref: "StoryType.publisher",
      many: true,
    }),
    sponsored: relationship({
      label: 'Sponsored',
      ref: 'Sponsorship.publisher',
      many: true,
    }),
    lang: select({
      label: '語系',
      datatype: 'enum',
      options: [
        { label: '繁體中文', value: 'zh-TW' },
        { label: '英文', value: 'en-US' },
        { label: '日文', value: 'ja-Jp' },
      ],
      defaultValue: 'zh-TW',
    }),
    category: relationship({ ref: 'Category', many: false }),
    full_content: checkbox({
      defaultValue: false,
    }),
    full_screen_ad: select({
      label: '蓋板',
      datatype: 'enum',
      options: [
        { label: '手機', value: 'mobile' },
        { label: '桌機', value: 'desktop' },
        { label: '所有尺寸', value: 'all' },
        { label: '無', value: 'none' },
      ],
      defaultValue: 'none',
    }),
    source_type: select({
      label: '資料來源',
      datatype: 'enum',
      options: [
        { label: '鏡週刊', value: 'mirrormedia' },
        { label: 'READr', value: 'readr' },
        { label: '鏡週刊 external', value: 'mm_external' },
        { label: 'rss', value: 'rss' },
        { label: 'empty', value: 'empty' },
      ],
      defaultValue: 'empty',
    }),
    paywall: checkbox({
      defaultValue: false,
    }),
    follower: relationship({
      label: "追蹤該媒體的用戶",
      ref: 'Member.follow_publisher',
      many: true,
    }),
    exclude_follower: relationship({
      label: "排除該媒體的用戶",
      ref: 'Member.exclude_publisher',
      many: true,
    }),
    //posts: relationship({ ref: 'Post.author', many: true }),
    wallet: text({
      label: '區塊鏈錢包',
    }),
    user: relationship({
      label: 'User',
      ref: 'User.publisher',
      many: true,
    }),
    statements: relationship({
      label: '媒體報表',
      ref: 'Statement.publisher',
      many: true,
    }),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'summary'],
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
