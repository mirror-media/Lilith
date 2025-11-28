import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  text,
  select,
  timestamp,
  json,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

enum ArtShowState {
  Draft = 'draft',
  Published = 'published',
  Scheduled = 'scheduled',
}

// Helper: 移除亂碼/隱形字元
function filterControlCharacters(resolvedData: Record<string, unknown>) {
  // eslint-disable-next-line no-control-regex
  const rules = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g
  Object.keys(resolvedData).forEach((key) => {
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
      validation: { isRequired: true },
    }),
    name: text({
      label: '單集名稱',
      validation: { isRequired: true },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: ArtShowState.Draft },
        { label: 'Published', value: ArtShowState.Published },
        { label: 'Scheduled', value: ArtShowState.Scheduled },
      ],
      defaultValue: ArtShowState.Draft,
      isIndexed: true,
      access: {
        create: allowRoles(admin, moderator, editor),
        update: allowRoles(admin, moderator, editor),
      },
    }),
    publishTime: timestamp({
      label: '發佈時間',
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Image',
    }),
    // heroVideo: relationship({
    //     label: '影片',
    //     ref: 'Video',
    // }),
    content: customFields.richTextEditor({
      label: '內文',
      website: 'mirrormedia',
      disabledButtons: [
        'code',
        'header-three', // H3
        'header-four', // H4
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'code-block',
        'annotation',
        'divider',
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
      ],
    }),
    author: relationship({
      label: '導演',
      ref: 'Contact',
      many: true,
    }),
    series: relationship({
      label: '相關單元',
      ref: 'Serie.post',
      many: true,
    }),
    show: relationship({
      label: '相關節目',
      ref: 'Show',
    }),
    // 儲存 Content 轉換後的 JSON
    contentApiData: json({
      label: 'Content API Data',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    // 儲存 Content 轉換後的 HTML
    contentHtml: text({
      label: 'Content HTML',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['slug', 'name', 'state', 'publishTime'],
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
      // 過濾控制字元
      resolvedData = filterControlCharacters(resolvedData)

      // 轉換 Rich Text (Content)
      const { content } = resolvedData
      if (content) {
        resolvedData.contentApiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()

        resolvedData.contentHtml =
          customFields.draftConverter.convertToHtml(content)
      }
      return resolvedData
    },
    validateInput: async ({ resolvedData, item, addValidationError }) => {
      const state = resolvedData.state ?? item?.state
      const publishTime = resolvedData.publishTime ?? item?.publishTime

      if (state === ArtShowState.Scheduled && !publishTime) {
        addValidationError('若狀態為 "Scheduled"，請填寫發佈時間')
      }

      // 若狀態為 Scheduled，發佈時間必須是未來
      if (state === ArtShowState.Scheduled && publishTime) {
        const now = new Date()
        const pubTimeDate = new Date(publishTime)
        // 給予 5 分鐘的緩衝時間，避免操作延遲導致驗證失敗
        const bufferTime = 5 * 60 * 1000

        if (pubTimeDate.getTime() < now.getTime() - bufferTime) {
          addValidationError('Scheduled 的發佈時間不能早於當下時間')
        }
      }
    },
  },
  graphql: {
    plural: 'ArtShows',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
