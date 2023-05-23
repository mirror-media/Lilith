import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  checkbox,
  text,
  select,
  integer,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      validation: { isRequired: true },
      label: '標題',
    }),
    slug: text({
      label: 'slug',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      }
    }),
    sortOrder: integer(),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已發布', value: 'published' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),
    brief: customFields.richTextEditor({
      label: '前言',
      website: 'mirrormedia',
      disabledButtons: ['header-four', 'background-video'],
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
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
    sections: relationship({
      label: '分區',
      ref: 'Section.topics',
      many: true,
    }),
    heroImageSize: select({
      label: '首圖尺寸',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Wide', value: 'wide' },
        { label: 'Small', value: 'small' },
      ],
      defaultValue: 'normal',
    }),
    isFeatured: checkbox({
      label: '置頂',
    }),
    title_style: select({
      label: '專題樣式',
      options: [{ label: 'Feature', value: 'feature' }],
      isIndexed: true,
      defaultValue: 'feature',
    }),
    type: select({
      label: '型態',
      isIndexed: true,
      defaultValue: 'list',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Timeline', value: 'timeline' },
        { label: 'Group', value: 'group' },
        { label: 'Portrait Wall', value: 'portraitwall' },
      ],
    }),
    style: text({
      label: 'CSS',
      ui: { displayMode: 'textarea' },
    }),
    tags: relationship({
      ref: 'Tag.topics',
      label: '標籤',
      many: true,
    }),
    posts: relationship({
      ref: 'Post.topics',
      label: '文章',
      many: true,
    }),
    javascript: text({
      label: 'javascript',
      ui: { displayMode: 'textarea' },
    }),
    dfp: text({
      validation: { isRequired: false },
      label: 'DFP code',
    }),
    mobile_dfp: text({
      validation: { isRequired: false },
      label: 'Mobile DFP code',
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
