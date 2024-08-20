import envVar from '../environment-variables'
import { graphql } from '@graphql-ts/schema'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  file,
  relationship,
  select,
  checkbox,
  timestamp,
  json,
  virtual,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: 'name',
      validation: { isRequired: true },
    }),
    file: file({
      label: '檔案',
      storage: 'files',
    }),
    videoSrc: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const filename = item?.file_filename
          if (!filename) {
            return ''
          }
          return `https://${envVar.gcs.bucket}/files/${filename}`
        },
      }),
    }),
    urlOriginal: text({
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    content: customFields.richTextEditor({
      label: '敘述',
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
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
    }),
    isFeed: checkbox({
      label: '供稿',
    }),
    related_posts: relationship({
      label: '相關文章',
      ref: 'Post.related_videos',
      many: true,
    }),
    manualOrderOfRelatedPosts: json({
      label: '相關文章手動排序結果',
    }),
    videoSection: select({
      label: '短影音分區',
      options: [
        { label: '新聞', value: 'news' },
        { label: '二創', value: 'creativity' },
      ],
      defaultValue: 'news',
      isIndexed: true,
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已發布', value: 'published' },
        { label: '預約發佈', value: 'scheduled' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),
    publishedDate: timestamp({
      isIndexed: true,
      label: '發佈日期',
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
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
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'videoSrc', 'videoSection'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, editor),
    },
  },

  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      return resolvedData
    },
  },
})

export default utils.addManualOrderRelationshipFields(
  [
    {
      fieldName: 'manualOrderOfRelatedPosts',
      targetFieldName: 'related_posts',
      targetListName: 'Post',
      targetListLabelField: 'title',
    },
  ],
  utils.addTrackingFields(listConfigurations)
)
