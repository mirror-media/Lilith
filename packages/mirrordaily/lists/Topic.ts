import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  checkbox,
  text,
  select,
  integer,
  json,
  timestamp,
} from '@keystone-6/core/fields'
import envVar from '../environment-variables'
import { State, ACL, UserRole, type Session } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

// group 專題固定 6 組「標籤＋對應文字」，須與 views/topic-group-tags 的 ROW_COUNT 一致
const GROUP_TAGS_ROW_COUNT = 6

enum TopicState {
  Draft = State.Draft,
  Published = State.Published,
  Scheduled = State.Scheduled,
}

function filterTopics(roles: string[]) {
  return ({ session }: { session?: Session }) => {
    switch (envVar.accessControlStrategy) {
      case ACL.GraphQL: {
        // Expose `published` topics
        return { state: { equals: TopicState.Published } }
      }
      case ACL.Preview: {
        // Expose all topics
        return true
      }
      case ACL.CMS:
      default: {
        // Expose all topics if user logged in
        return (
          session?.data?.role !== undefined &&
          roles.indexOf(session.data.role) > -1
        )
      }
    }
  }
}

const listConfigurations = list({
  fields: {
    name: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      label: '標題',
    }),
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      ui: {
        views: './lists/views/auto-slug/index',
      },
    }),
    sortOrder: integer(),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: TopicState.Draft },
        { label: '已發布', value: TopicState.Published },
        { label: '預約發佈', value: TopicState.Scheduled },
      ],
      defaultValue: TopicState.Draft,
      isIndexed: true,
    }),
    publishedDate: timestamp({
      isIndexed: true,
      isFilterable: true,
      label: '發佈日期',
      validation: { isRequired: true },
      defaultValue: { kind: 'now' },
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
    apiDataBrief: json({
      label: 'Brief資料庫使用',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    leading: select({
      label: '標頭樣式',
      options: [
        { label: 'video', value: 'video' },
        //{ label: 'slideshow', value: 'slideshow' },
        { label: 'image', value: 'image' },
      ],
      isIndexed: true,
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
      ui: {
        displayMode: 'cards',
        cardFields: ['imageFile'],
        inlineCreate: {
          fields: ['name', 'imageFile', 'waterMark'],
        },
        inlineConnect: true,
        views: './lists/views/sorted-relationship/index',
      },
    }),
    heroUrl: text({
      label: '首圖連結 URL',
      db: {
        isNullable: true,
      },
    }),
    heroVideo: relationship({
      label: '首圖影片（Leading Video）',
      ref: 'Video',
    }),
    slideshow_images: relationship({
      ref: 'Photo',
      label: 'slideshow 圖片',
      many: true,
      ui: {
        // TODO: 未被使用，移除此欄位
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    manualOrderOfSlideshowImages: json({
      label: 'slideshow 圖片排序結果',
      defaultValue: null,
      ui: {
        // TODO: 未被使用，移除此欄位
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
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
    type: select({
      label: '型態',
      isIndexed: true,
      defaultValue: 'list',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Group', value: 'group' },
      ],
      ui: {
        views: './lists/views/topic-type-select/index',
      },
    }),
    groupTags: json({
      label: 'Group 標籤',
      // 固定 6 組「標籤＋對應文字(限6字)」，type=group 才顯示
      // 前端讀此 json：text 當分區標題、tagId 過濾文章、陣列順序即排序
      isFilterable: false,
      ui: {
        views: './lists/views/topic-group-tags/index',
      },
    }),
    tags: relationship({
      ref: 'Tag.topics',
      label: '標籤',
      many: true,
      ui: {
        // 只隱藏 CMS 畫面，欄位/關聯/GraphQL 仍在；group 改用 groupTags
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    posts: relationship({
      ref: 'Post.topics',
      label: '文章',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship-filter-draft-selfpost/index',
        labelField: 'title',
      },
    }),
    externals: relationship({
      ref: 'External.topics',
      label: '外部文章',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship-filter-draft-selfpost/index',
        labelField: 'title',
      },
    }),
    style: text({
      label: 'CSS',
      ui: { displayMode: 'textarea' },
    }),
    isFeatured: checkbox({
      label: '置頂',
    }),
    title_style: select({
      label: '專題樣式',
      options: [{ label: 'Feature', value: 'feature' }],
      isIndexed: true,
      defaultValue: 'feature',
      ui: {
        // TODO: 未被使用，移除此欄位
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    sections: relationship({
      label: '分區',
      ref: 'Section.topics',
      many: true,
      ui: {
        // TODO: 未被使用，移除此欄位
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    javascript: text({
      label: 'javascript',
      ui: {
        displayMode: 'textarea',
        // TODO: 未被使用，移除此欄位
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    dfp: text({
      validation: { isRequired: false },
      label: 'DFP code',
      ui: {
        // TODO: 未被使用，移除此欄位
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    mobile_dfp: text({
      validation: { isRequired: false },
      label: 'Mobile DFP code',
      ui: {
        // TODO: 未被使用，移除此欄位
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
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
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
    filter: {
      query: filterTopics([
        UserRole.Admin,
        UserRole.Moderator,
        UserRole.Editor,
      ]),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, item }) => {
      const { brief } = resolvedData
      if (brief) {
        resolvedData.apiDataBrief = customFields.draftConverter
          .convertToApiData(brief)
          .toJS()
      }
      // 非 group 清空 groupTags；只在有動到 groupTags 或 type 時處理，避免每次更新多寫 null
      const touchedGroup =
        'groupTags' in resolvedData || resolvedData.type !== undefined
      if (touchedGroup) {
        const effectiveType = resolvedData.type ?? item?.type
        if (effectiveType !== 'group') {
          resolvedData.groupTags = null
        }
      }
      return resolvedData
    },
    validateInput: async ({ resolvedData, addValidationError }) => {
      const groupTags = resolvedData.groupTags
      // 防呆（擋 API 直連）：有帶值時只接受 null 或陣列
      if (
        groupTags !== undefined &&
        groupTags !== null &&
        !Array.isArray(groupTags)
      ) {
        addValidationError('Group 標籤格式錯誤')
      }
      if (Array.isArray(groupTags)) {
        // 固定 6 格，擋超量列數
        if (groupTags.length > GROUP_TAGS_ROW_COUNT) {
          addValidationError(`Group 標籤最多 ${GROUP_TAGS_ROW_COUNT} 組`)
        }
        groupTags.forEach((row, idx) => {
          const tagId = row && typeof row.tagId === 'string' ? row.tagId : ''
          const text = row && typeof row.text === 'string' ? row.text : ''
          const hasTag = tagId.length > 0
          const hasText = text.trim().length > 0

          // 對應文字每格最多 6 個字（以 code point 計，中文一個字算一個）
          if (Array.from(text).length > 6) {
            addValidationError(`第 ${idx + 1} 組：對應文字最多 6 個字`)
          }

          // 一組必須「標籤與對應文字同時填寫」，或整格留空
          if (hasTag !== hasText) {
            addValidationError(
              `第 ${idx + 1} 組：標籤與對應文字需同時填寫，或整組留空`
            )
          }
        })

        // 6 格的標籤必須互斥，不可重複選到同一個 Tag
        const tagIds = groupTags
          .map((row) =>
            row && typeof row.tagId === 'string' ? row.tagId : null
          )
          .filter((id): id is string => !!id)
        const hasDuplicate = new Set(tagIds).size !== tagIds.length
        if (hasDuplicate) {
          addValidationError('Group 標籤不可重複選擇同一個標籤')
        }
      }
    },
    afterOperation: async ({ item }) => {
      if (item?.id && item.state == 'published') {
        const result = fetch(envVar.topicServiceApi + '?topic_id=' + item.id, {
          method: 'GET',
        })
        console.log(result)
      }
    },
  },
})

export default utils.addManualOrderRelationshipFields(
  [],
  utils.addTrackingFields(listConfigurations)
)
