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
import envVar from '../environment-variables'
import { State, ACL, UserRole, type Session } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum TopicState {
  Draft = State.Draft,
  Published = State.Published,
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
      label: '原ID',
      isIndexed: 'unique',
    }),
    sortOrder: integer(),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: TopicState.Draft },
        { label: '已發布', value: TopicState.Published },
      ],
      defaultValue: TopicState.Draft,
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
        { label: 'slideshow', value: 'slideshow' },
        { label: 'image', value: 'image' },
      ],
      isIndexed: true,
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
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
    }),
    manualOrderOfSlideshowImages: json({
      label: 'slideshow 圖片排序結果',
      defaultValue: null,
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
    style: text({
      label: 'CSS',
      ui: { displayMode: 'textarea' },
    }),
    isFeatured: checkbox({
      label: '置頂',
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
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
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
    resolveInput: async ({ resolvedData }) => {
      const { brief } = resolvedData
      if (brief) {
        resolvedData.apiDataBrief = customFields.draftConverter
          .convertToApiData(brief)
          .toJS()
      }
      return resolvedData
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
