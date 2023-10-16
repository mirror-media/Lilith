// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  checkbox,
  text,
  select,
  timestamp,
  integer,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      isIndexed: 'unique',
      validation: { isRequired: true },
      label: '專題名稱',
    }),
    subtitle: text({
      label: '副標',
      validation: { isRequired: false },
    }),
    sortOrder: integer({
      label: '排序順位',
    }),
    state: select({
      isIndexed: true,
      defaultValue: 'draft',
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
      ],
      label: '狀態',
    }),
    description: text({
      label: '前言',
      ui: { displayMode: 'textarea' },
    }),
    leading: select({
      label: '標頭樣式',
      options: [
        { label: 'video', value: 'video' },
        { label: 'slideshow', value: 'slideshow' },
        { label: 'image', value: 'image' },
      ],
      isIndexed: true,
    }),
    categories: relationship({
      many: true,
      label: '分類',
      ref: 'Category',
    }),
    heroVideo: relationship({
      label: 'Leading Video',
      ref: 'Video',
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
    }),
    heroImageSize: select({
      defaultValue: 'normal',
      options: [
        { label: 'extend', value: 'extend' },
        { label: 'normal', value: 'normal' },
        { label: 'small', value: 'small' },
      ],
      label: '首圖尺寸',
    }),
    ogTitle: text({
      label: 'FB分享標題',
      validation: { isRequired: false },
    }),
    ogDescription: text({
      label: 'FB分享說明',
      validation: { isRequired: false },
    }),
    ogImage: relationship({
      ref: 'Photo',
      label: 'FB分享縮圖',
    }),
    isFeatured: checkbox({
      label: '置頂',
    }),
    writers: relationship({
      ref: 'Author.projects',
      label: '作者',
      many: true,
    }),
    title_style: select({
      label: '專題樣式',
      options: [{ label: 'feature', value: 'feature' }],
      isIndexed: true,
      defaultValue: 'feature',
    }),
    style: text({
      label: 'CSS',
      ui: { displayMode: 'textarea' },
    }),
    tags: relationship({
      ref: 'Tag.projects',
      label: '標籤',
      many: true,
    }),
    posts: relationship({
      ref: 'Post.projects',
      label: '標籤',
      many: true,
    }),
    javascript: text({
      label: 'javascript',
      ui: { displayMode: 'textarea' },
    }),
    publishTime: timestamp({
      label: '發布時間',
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
