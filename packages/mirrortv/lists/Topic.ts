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
import { v4 as uuidv4 } from 'uuid'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

// 移除亂碼/隱形字元
function filterControlCharacters(resolvedData: Record<string, any>) {
  // 排除 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F (即保留 Tab, Line Feed, Carriage Return)
  // eslint-disable-next-line no-control-regex
  const rules = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g

  Object.keys(resolvedData).forEach((key) => {
    // 針對字串型別的欄位做處理
    if (typeof resolvedData[key] === 'string') {
      resolvedData[key] = resolvedData[key].replace(rules, '')
    }
  })
  return resolvedData
}

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'Slug',
      isIndexed: 'unique',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === 'create' && !resolvedData.slug) {
            return uuidv4()
          }
          return resolvedData.slug
        },
      },
    }),
    sortOrder: integer({
      label: '排序順位',
      isIndexed: 'unique',
      validation: {
        min: 1,
      },
    }),
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    leading: select({
      label: '標頭樣式',
      options: [
        { label: 'video', value: 'video' },
        { label: 'slideshow', value: 'slideshow' },
        { label: 'image', value: 'image' },
        { label: 'multivideo', value: 'multivideo' },
      ],
      defaultValue: 'image',
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Image',
    }),
    heroVideo: relationship({
      label: '影片',
      ref: 'Video',
    }),
    slideshow: relationship({
      label: '輪播文章',
      ref: 'Post',
      many: true,
    }),
    multivideo: relationship({
      label: '輪播影片',
      ref: 'Video',
      many: true,
    }),
    post: relationship({
      label: 'POST',
      ref: 'Post',
      many: true,
    }),
    sortDir: select({
      label: '時間軸排序方向',
      options: [
        { label: 'asc', value: 'asc' },
        { label: 'desc', value: 'desc' },
      ],
      defaultValue: 'desc',
    }),
    categories: relationship({
      label: '分類',
      ref: 'Category',
      many: true,
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
    }),
    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      // 依照 K5 邏輯：不給 contributor create/update 權限 (只能是 draft)
      access: {
        create: allowRoles(admin, moderator, editor),
        update: allowRoles(admin, moderator, editor),
      },
      isIndexed: true,
    }),
    brief: customFields.richTextEditor({
      label: '前言',
      website: 'mirrortv',
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
    // 儲存 Brief 轉換後的 JSON
    briefApiData: json({
      label: 'Brief API Data',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    // 儲存 Brief 轉換後的 HTML
    briefHtml: text({
      label: 'Brief HTML',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    facebook: text({ label: 'Facebook' }),
    instagram: text({ label: 'Instagram' }),
    line: text({ label: 'Line' }),
    ogTitle: text({ label: 'FB 分享標題' }),
    ogDescription: text({ label: 'FB 分享說明' }),
    ogImage: relationship({
      label: 'FB 分享縮圖',
      ref: 'Image',
    }),
    isFeatured: checkbox({
      label: '置頂',
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'slug', 'name', 'state', 'leading', 'isFeatured'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, editor, contributor),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      // 過濾非法字元
      resolvedData = filterControlCharacters(resolvedData)
      // 處理 Brief 轉換
      const { brief } = resolvedData
      if (brief) {
        resolvedData.briefApiData = customFields.draftConverter
          .convertToApiData(brief)
          .toJS()

        // resolvedData.briefHtml =
        //   customFields.draftConverter.convertToHtml(brief)
      }

      return resolvedData
    },
  },
  graphql: {
    plural: 'Topics',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addManualOrderRelationshipFields(
  [],
  utils.addTrackingFields(listConfigurations)
)
