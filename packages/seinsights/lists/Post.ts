import envVar from '../environment-variables'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, integer, relationship, select, json, timestamp, virtual,} from '@keystone-6/core/fields'


const {
  allowRoles,
  admin,
  moderator,
  editor,
} = utils.accessControl

enum UserRole {
  Admin = 'admin',
  Moderator = 'moderator',
  Editor = 'editor',
  Contributor = 'contributor',
}

enum Status {
  Published = 'published',
  Draft = 'draft',
  Scheduled = 'scheduled',
  Archived = 'archived',
}

type Session = {
  data: {
    id: string
    role: UserRole
  }
}


function filterPosts({ session }: { session: Session }) {
  switch (envVar.accessControlStrategy) {
    case 'gql': {
      // Only expose `published` posts
      return { status: { equals: Status.Published } }
    }
    case 'preview': {
      // Expose all posts, including `published`, `draft` and `archived` posts
      return true
    }
    case 'cms':
    default: {
      //  TODO grant access permission if needed
      //  return session?.data?.role === UserRole.Admin ||
      //    session?.data?.role === UserRole.Editor

      // Expose all posts, including `published`, `draft` and `archived` posts if user logged in
      return Boolean(session?.data?.role)
    }
  }
}

const listConfigurations = list({
  fields: {
    title: text({
      label: '標題',
    }),
    subtitle: text({
      label: '副標',
    }),
    weight: integer({
      label: '權重',
      defaultValue: 85,
      validation: {
        min: 1,
        max: 9999,
      }
    }),
    status: select({
      label: '狀態',
      type: 'enum',
      options: [
        { label: '出版', value: Status.Published },
        { label: '草稿', value: Status.Draft },
        { label: '排程', value: Status.Scheduled },
        { label: '下架', value: Status.Archived },
      ],
      defaultValue: 'draft',
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    publishDate: timestamp({
      label: '發布日期',
      defaultVaule: { kind: 'now' },
    }),
    section: relationship({
      label: '大分類',
      ref: 'Section.posts',
      ui: {
        displayMode: 'cards',
        cardFields: ['name'],
        itemView: {
          fieldMode: 'read',
        },
      },
      many: false,
    }),
    category: relationship({
      label: '小分類',
      ref: 'Category.posts',
      ui: {
        hideCreate: true,
      },
      many: false,
    }),
    columns: relationship({
      label: '作者',
      ref: 'Column.posts',
      ui: {
        createView: { fieldMode: 'hidden' },
        hideCreate: true,
      },
      many: true,
    }),
    region: select({
      label: '地區',
      options:[
        { label: '台灣', value: 'tw'},
        { label: '國際', value: 'global'},
      ]
    }),
    heroImage: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    heroCaption: text({
      label: '首圖圖說',
    }),
    brief: text({
      label: '前言',
      ui: {
        displayMode: 'textarea',
      }
    }),
    content: customFields.richTextEditor({
      label: '內文',
    }),
    relatedPosts: customFields.relationship({
      label: '延伸閱讀',
      ref: 'Post',
      many: true,
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
    }),
    tags: relationship({
      ref: 'Tag.posts',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    // 
    // previewButton: virtual({
    //   field: graphql.field({
    //     type: graphql.String,
    //     resolve(item: Record<string, unknown>): string {
    //       return `/story/${item?.id}`
    //     },
    //   }),
    //   ui: {
    //     views: require.resolve('./preview-button'),
    //   },
    // }),
    oldCategory:select({
      'label': '舊內容分類（工程用）',
      options:[
        { label: 'article', value: 'article' },
        { label: 'news', value: 'news' },
        { label: 'story', value: 'story' },
      ],
      ui:{
        createView:{fieldMode: 'hidden'},
        itemView: { fieldMode: 'read' },
      }
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  ui: {
    labelField: 'title',
    listView: {
      initialColumns: ['id', 'title', 'publishDate', 'status'],
      initialSort: { field: 'publishDate', direction: 'DESC' },
    },
  },

  access: {
    operation: {
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
    filter: {
      query: filterPosts,
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      const { content, category } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      //relate section and post by corresponding category
      // if (category) {
      //   if (category?.disconnect === true) {
      //     resolvedData.section = {
      //       disconnect: true,
      //     }
      //   } else if (category?.connect?.id) {
      //     // Find section id according to category id
      //     const categoryItem = await context.query.Category.findOne({
      //       where: { id: category.connect.id },
      //       query: 'section { id }',
      //     })
      //     if (categoryItem?.section?.id) {
      //       resolvedData.section = {
      //         connect: {
      //           id: Number(categoryItem.section.id),
      //         },
      //       }
      //     }
      //   }
      // }
      return resolvedData
    },
    validateInput: async ({ operation, item, context, resolvedData, addValidationError }) => {

      // publishDate is must while status is not `draft`
      if (operation == 'create') {
        const { status } = resolvedData
        if (status && status != 'draft') {
          const { publishDate } = resolvedData
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        }
      }
      if (operation == 'update') {
        if (resolvedData.status && resolvedData.status != 'draft') {
          let publishDate = resolvedData.publishDate || item.publishDate
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        }
        else if (resolvedData.publishDate === null) {
          let status = resolvedData.status || item.status
          if (status != 'draft') {
            addValidationError('需要填入發布時間')
          }
        }
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)

