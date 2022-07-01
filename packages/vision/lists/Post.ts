import envVar from '../environment-variables'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  text,
  integer,
  relationship,
  select,
  json,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'

const {
  allowRoles,
  admin,
  moderator,
  //editor,
  //owner,
} = utils.accessControl

enum UserRole {
  Admin = 'admin',
  Moderator = 'moderator',
  Editor = 'editor',
  Contributor = 'contributor',
}

enum PostStatus {
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
      return { status: { equals: PostStatus.Published } }
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
    slug: text({
      label: 'slug（Longform 網址）',
      isIndexed: 'unique',
    }),
    name: text({
      label: '標題',
      validation: {
        isRequired: true,
        length: {
          min: 1,
        },
      },
    }),
    titleSize: integer({
      label: '標題字級（Longform 專用）',
      validation: {
        max: 200,
        min: 20,
      },
    }),
    titleColor: text({
      label: '標題顏色Hex color code（Longform 專用）',
      defaultValue: '#000',
      validation: {
        match: {
          regex: new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
          explanation: '標題顏色格式不符合 Hex color code',
        },
      },
    }),
    subtitle: text({
      label: '副標（Longform）',
      validation: {
        isRequired: false,
      },
    }),
    subtitleSize: integer({
      label: '副標字級（Longform 專用）',
      validation: {
        max: 100,
        min: 14,
      },
    }),
    subtitleColor: text({
      label: '副標顏色Hex color code（Longform 專用）',
      defaultValue: '#000',
      validation: {
        match: {
          regex: new RegExp('^^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
          explanation: '副標顏色格式不符合 Hex color code',
        },
      },
    }),
    type: select({
      options: [
        { label: '文章', value: 'article' },
        { label: 'Longform', value: 'project' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'article',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    status: select({
      options: [
        { label: '出版', value: PostStatus.Published },
        { label: '草稿', value: PostStatus.Draft },
        { label: '排程', value: PostStatus.Scheduled },
        { label: '下架', value: PostStatus.Archived },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'draft',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    weight: integer({
      label: '權重',
      defaultValue: 85,
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
    ogImage: customFields.relationship({
      label: 'og Image',
      ref: 'Photo',
      customConfig: {
        isImage: true,
      },
    }),
    headLogo: customFields.relationship({
      label: '自訂 Logo（Longform 專用）',
      ref: 'Photo',
      // ui: {
      //     hideCreate: true,
      // },
      customConfig: {
        isImage: true,
      },
    }),
    heroMob: customFields.relationship({
      label: '手機首圖（Longform 專用）',
      ref: 'Photo',
      // ui: {
      //     hideCreate: true,
      // },
      customConfig: {
        isImage: true,
      },
    }),
    heroStyle: select({
      label: '首圖樣式',
      options: [
        { label: '滿版', value: 'full' },
        { label: '一般', value: 'normal' },
      ],
      defaultValue: 'normal',
    }),
    heroVideo: text({
      label: '首圖影片',
    }),
    heroCaption: text({
      label: '首圖圖說',
    }),
    ref_authors: relationship({
      label: '作者',
      ref: 'Author.ref_posts',
      ui: {
        inlineEdit: { fields: ['name'] },
        createView: { fieldMode: 'hidden' },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    reporter: text({
      label: '記者（一般文章使用）',
      ui: { displayMode: 'textarea' },
    }),
    author: text({
      label: '作者（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    photographer: text({
      label: '攝影（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    video: text({
      label: '影音（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    designer: text({
      label: '設計（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    engineer: text({
      label: '工程（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    data: text({
      label: '資料分析（Longform 專用）',
      ui: { displayMode: 'textarea' },
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
    publishDate: timestamp({
      label: '發布日期',
      validation: {
        isRequired: true,
      },
    }),
    ref_events: relationship({
      label: '相關活動',
      ref: 'Event.ref_posts',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    project: relationship({
      ref: 'Project.posts',
      ui: {
        itemView: { fieldMode: 'hidden' },
        hideCreate: true,
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    group: relationship({
      label: '大分類（必選）',
      ref: 'Group.posts',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: false,
    }),
    category: relationship({
      label: '次分類（必選）',
      ref: 'Category.posts',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: false,
    }),
    classify: relationship({
      label: '小分類（必選）',
      ref: 'Classify.posts',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: false,
    }),
    sdg: relationship({
      ref: 'SDG.posts',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
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
    copyright: select({
      options: [
        { label: '禁止轉載', value: 'reserved' },
        { label: '部分允許轉載', value: 'partial' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'reserved',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    previewButton: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>): string {
          return `/story/${item?.id}`
        },
      }),
      ui: {
        views: require.resolve('./preview-button'),
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
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'publishDate', 'slug', 'status'],
      initialSort: { field: 'publishDate', direction: 'DESC' },
      pageSize: 50,
    },
  },

  access: {
    operation: {
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
    filter: {
      query: filterPosts,
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      const { content, classify } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      // The following classify condition block is a WORKAROUND.
      // In the normalized database design,
      // the `post` will only have the relationship with the `classify`,
      // and it won't have the relationship with `group` or `category` directly.
      // It's the `classify` which will have the relationship with `category`
      // and `category` will have the relationship with `group`.
      // However, because we want to generate the GQL that supports to find
      // the posts under the certain group, or under the certain category.
      // We let the `post` to have the relationship with `group` and `category` in
      // this `post` list configuration.
      // But we hide `group` and `category` fields in the web UI,
      // and the values are also controlled by the following hook.
      if (classify) {
        if (classify?.disconnect === true) {
          resolvedData.group = {
            disconnect: true,
          }
          resolvedData.category = {
            disconnect: true,
          }
        } else if (classify?.connect?.id) {
          // Find category id and group id according to classify id
          const classifyItem = await context.query.Classify.findOne({
            where: { id: classify.connect.id },
            query: 'category { id group { id } }',
          })

          if (classifyItem?.category?.id) {
            resolvedData.category = {
              connect: {
                id: Number(classifyItem.category.id),
              },
            }
          }

          if (classifyItem?.category?.group?.id) {
            resolvedData.group = {
              connect: {
                id: Number(classifyItem.category.group.id),
              },
            }
          }
        }
      }

      return resolvedData
    },
    afterOperation: async ({
      operation,
      originalItem,
      item,
      resolvedData,
      context,
    }) => {
      if (operation == 'delete') {
        const orig_id = originalItem['id']
        const backupItem = originalItem
        delete backupItem['id']
        const fields = [
          'heroMob',
          'headLogo',
          'ogImage',
          'heroImage',
          'project',
          'group',
          'category',
          'classify',
          'createdBy',
          'updatedBy',
        ]
        fields.forEach(function(field) {
          const fieldId = field + 'Id'
          //console.log("id: " + fieldId)
          if (originalItem[fieldId] !== null) {
            const fieldValue = { connect: { id: originalItem[fieldId] } }
            backupItem[field] = fieldValue
          }
          delete backupItem[fieldId]
        })
        const new_post = await context.db.Post.createOne({
          data: backupItem,
        })
        //console.log(context.prisma)
        const update_post = await context.prisma.post.update({
          where: { id: new_post['id'] },
          data: {
            id: orig_id,
            status: 'archived',
          },
        })
        if (!update_post) {
          console.log(update_post, item, resolvedData)
        }
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
