import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { checkbox, relationship, timestamp, text, select, json } from '@keystone-6/core/fields';

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
      label: 'slug網址名稱（英文）',
      isIndexed: 'unique',
      validation: { isRequired: true }
    }),
    title: text({
      label: '標題',
      validation: { isRequired: true }
    }),
    subtitle: text({
      label: '副標',
      validation: { isRequired: false }
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
    sections: relationship({
      label: '大分類',
      ref: 'Section.posts',
      many: true,
    }),
    categories: relationship({
      label: '小分類',
      ref: 'Category.posts',
      many: true,
    }),
    writers: relationship({
      label: '作者',
      ref: 'Contact',
      many: true,
    }),
    photographers: relationship({
      label: '攝影',
      ref: 'Contact',
      many: true,
    }),
    camera_man: relationship({
      label: '影音',
      ref: 'Contact',
      many: true,
    }),
    designers: relationship({
      label: '設計',
      ref: 'Contact',
      many: true,
    }),
    engineers: relationship({
      label: '工程',
      ref: 'Contact',
      many: true,
    }),
    vocals: relationship({
      label: '主播',
      ref: 'Contact',
      many: true,
    }),
    extend_byline: text({
      label: '作者（其他）',
      validation: { isRequired: false },
    }),
    heroVideo: relationship({
      label: '首圖影片（Leading Video）',
      ref: 'Video',
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
    }),
    heroCaption: text({
      label: '首圖圖說',
      validation: { isRequired: false }
    }),
    heroImageSize: select({
      label: '首圖尺寸',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Wide', value: 'wide' },
        { label: 'Small', value: 'small' }
      ],
      defaultValue: 'normal'
    }),
    style: select({
      label: '文章樣式',
      isIndexed: true,
      defaultValue: 'article',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Wide', value: 'wide' },
        { label: 'Projects', value: 'projects' },
        { label: 'Photography', value: 'photography' },
        { label: 'Script', value: 'script' },
        { label: 'Campaign', value: 'campaign' },
      ],
    }),
    brief: customFields.richTextEditor({
      label: '前言',
    }),
    content: customFields.richTextEditor({
      label: '內文',
    }),
    topics: relationship({
      label: '專題',
      ref: 'Topic.posts',
    }),
    titleColor: select({
      label: '標題模式',
      options: [
        { label: 'light', value: 'light' },
        { label: 'dark', value: 'dark' }],
        defaultValue: 'light',
    }),
    relateds: relationship({
      label: '相關文章',
      ref: 'Post',
      many: true,
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag.posts',
      many: true,
    }),
    og_title: text({
      label: 'FB分享標題',
      validation: { isRequired: false },
    }),
    og_description: text({
      label: 'FB分享說明',
      validation: { isRequired: false }
    }),
    og_image: relationship({
      label: 'FB分享縮圖',
      ref: 'Photo',
    }),
    isFeatured: checkbox({
      label: '置頂',
      defaultValue: false,
    }),
    isAdvertised: checkbox({
      label: '廣告文案',
      defaultValue: false,
    }),
    hiddenAdvertised: checkbox({
      label: 'google廣告違規',
      defaultValue: false,
    }),
    isCampaign: checkbox({
      label: '活動',
      defaultValue: false,
    }),
    isAdult: checkbox({
      label: '18禁',
      defaultValue: false,
    }),
    lockJS: checkbox({
      label: '鎖定右鍵',
      defaultValue: false,
    }),
    adTrace: text({
      label: '追蹤代碼',
      ui: { displayMode: 'textarea' }
    }),
    css: text({
      ui: { displayMode: 'textarea' },
      label: 'CSS'
    }),
    apiDataBrief: json({
      label: 'Brief資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    labelField: 'slug',
    listView: {
      initialColumns: ['id', 'slug', 'state'],
      initialSort: { field: 'publishedDate', direction: 'DESC' },
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
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { content, brief } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      if (brief) {
        resolvedData.apiDataBrief = customFields.draftConverter
          .convertToApiData(brief)
          .toJS()
      }
      return resolvedData
    }
  }
})
export default utils.addTrackingFields(listConfigurations)
