import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  checkbox,
  text,
  select,
  integer,
  json,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      validation: { isRequired: true },
      label: '標題',
    }),
    slug: text({
      label: '原ID',
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
      disabledButtons: [
        'code',
        'header-four',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'code-block',
        'annotation',
        'divider',
        'embed',
        'font-color',
        'image',
        'info-box',
        'slideshow',
        'table',
        'text-align',
        'color-box',
        'background-color',
        'background-image',
        'background-video',
        'related-post',
        'side-index',
        'video',
        'audio',
        'youtube',
      ],
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
    og_title: text({
      label: 'FB分享標題',
      validation: { isRequired: false },
    }),
    og_description: text({
      label: 'FB分享說明',
      validation: { isRequired: false },
    }),
    og_image: relationship({
      label: 'FB分享縮圖',
      ref: 'Photo',
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
    slideshow_images: relationship({
      ref: 'Photo',
      label: 'slideshow 圖片',
      many: true,
    }),
    manualOrderOfSlideshowImages: json({
      label: 'slideshow 圖片排序結果',
      defaultValue: null,
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
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'slug', 'sortOrder'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addManualOrderRelationshipFields(
  [
    {
      fieldName: 'manualOrderOfSlideshowImages',
      targetFieldName: 'slideshow_images',
      targetListName: 'Photo',
      targetListLabelField: 'name',
    },
  ],
  utils.addTrackingFields(listConfigurations)
)
