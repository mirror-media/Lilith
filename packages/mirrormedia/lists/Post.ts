import { customFields, utils } from '@mirrormedia/lilith-core'
import { graphql, list } from '@keystone-6/core'
import { KeystoneContext, JSONValue } from '@keystone-6/core/types'
import {
  checkbox,
  relationship,
  timestamp,
  text,
  select,
  json,
  virtual,
} from '@keystone-6/core/fields'
import envVar from '../environment-variables'
// @ts-ignore draft-js does not have typescript definition
import { RawContentState } from 'draft-js'

const { allowRoles, admin, moderator, editor } = utils.accessControl

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
  Invisible = 'invisible',
}

type Session = {
  data: {
    id: string
    role: UserRole
  }
}

function filterPosts(roles: string[]) {
  return ({ session }: { session?: Session }) => {
    switch (envVar.accessControlStrategy) {
      case 'gql': {
        // Expose `published` and `invisible` posts
        return { state: { in: [PostStatus.Published, PostStatus.Invisible] } }
      }
      case 'preview': {
        // Expose all posts, including `published`, `draft` and `archived` posts
        return true
      }
      case 'cms':
      default: {
        // Expose all posts, including `published`, `draft` and `archived` posts if user logged in
        return (
          session?.data?.role !== undefined &&
          roles.indexOf(session.data.role) > -1
        )
      }
    }
  }
}

type FieldMode = 'edit' | 'read' | 'hidden'

type ListTypeInfo = {
  session?: Session
  context: KeystoneContext
  item: Record<string, unknown>
}

type MaybeItemFunction<T extends FieldMode, ListTypeInfo> =
  | T
  | ((args: ListTypeInfo) => Promise<T>)

const itemViewFunction: MaybeItemFunction<FieldMode, ListTypeInfo> = async ({
  session,
  context,
  item,
}) => {
  if (session?.data?.role == UserRole.Editor) {
    const { lockBy } = await context.prisma.Post.findUnique({
      where: { id: Number(item.id) },
      select: {
        lockBy: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!lockBy) {
      const lockExpireAt = new Date(
        new Date().setMinutes(
          new Date().getMinutes() + envVar.lockDuration,
          0,
          0
        )
      ).toISOString()
      const updatedPost = await context.prisma.Post.update({
        where: { id: Number(item.id) },
        data: {
          lockBy: {
            connect: {
              id: Number(session.data?.id),
            },
          },
          lockExpireAt: lockExpireAt,
        },
        select: {
          lockBy: {
            select: {
              id: true,
            },
          },
        },
      })
      return Number(updatedPost.lockBy?.id) === Number(session.data?.id)
        ? 'edit'
        : 'read'
    } else if (lockBy.id == session.data?.id) {
      return 'edit'
    }
    return 'read'
  }

  return 'edit'
}

const listConfigurations = list({
  fields: {
    lockBy: relationship({
      ref: 'User',
      label: '誰正在編輯',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        displayMode: 'cards',
        cardFields: ['name'],
      },
    }),
    lockExpireAt: timestamp({
      isIndexed: true,
      db: {
        isNullable: true,
      },
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    slug: text({
      label: 'slug網址名稱（英文）',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    title: text({
      label: '標題',
    }),
    subtitle: text({
      label: '副標',
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已發布', value: 'published' },
        { label: '預約發佈', value: 'scheduled' },
        { label: '下線', value: 'archived' },
        { label: '前台不可見', value: 'invisible' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),
    publishedDate: timestamp({
      isIndexed: true,
      isFilterable: true,
      label: '發佈日期',
      validation: { isRequired: true },
      defaultValue: { kind: 'now' },
    }),
    publishedDateString: text({
      label: '發布日期',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
    }),
    updateTimeStamp: checkbox({
      label: '下次存檔時自動更改成「現在時間」',
      isFilterable: false,
      defaultValue: false,
    }),
    sections: relationship({
      label: '大分類',
      ref: 'Section.posts',
      many: true,
    }),
    manualOrderOfSections: json({
      isFilterable: false,
      label: '大分類手動排序結果',
    }),
    categories: relationship({
      label: '小分類',
      ref: 'Category.posts',
      many: true,
    }),
    manualOrderOfCategories: json({
      isFilterable: false,
      label: '小分類手動排序結果',
    }),
    writers: relationship({
      label: '作者',
      ref: 'Contact',
      many: true,
    }),
    manualOrderOfWriters: json({
      label: '作者手動排序結果',
      isFilterable: false,
    }),
    photographers: relationship({
      label: '攝影',
      ref: 'Contact',
      many: true,
    }),
    camera_man: relationship({
      label: '影音',
      ref: 'Contact',
      many: true,
    }),
    designers: relationship({
      label: '設計',
      ref: 'Contact',
      many: true,
    }),
    engineers: relationship({
      label: '工程',
      ref: 'Contact',
      many: true,
    }),
    vocals: relationship({
      label: '主播',
      ref: 'Contact',
      many: true,
    }),
    extend_byline: text({
      label: '作者（其他）',
      validation: { isRequired: false },
    }),
    heroVideo: relationship({
      label: '首圖影片（Leading Video）',
      ref: 'Video',
      ui: {
        views: './lists/views/sorted-relationship/index',
      },
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        displayMode: 'cards',
        cardFields: ['imageFile'],
        linkToItem: true,
        inlineConnect: true,
        views: './lists/views/sorted-relationship/index',
      },
    }),
    heroCaption: text({
      label: '首圖圖說',
      isFilterable: false,
      validation: { isRequired: false },
    }),
    style: select({
      label: '文章樣式',
      isIndexed: true,
      defaultValue: 'article',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Wide', value: 'wide' },
        { label: 'Projects', value: 'projects' },
        { label: 'Photography', value: 'photography' },
        { label: 'Script', value: 'script' },
        { label: 'Campaign', value: 'campaign' },
      ],
    }),
    brief: customFields.richTextEditor({
      label: '前言',
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
      website: 'mirrormedia',
    }),
    trimmedContent: virtual({
      label: '擷取前5段的內文（不包括換行）',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
      field: graphql.field({
        type: graphql.JSON,
        resolve: async (
          item: Record<string, unknown>
        ): Promise<JSONValue | undefined> => {
          const content: RawContentState = item?.content
          const blocks = content?.blocks || []
          const entityMap = content?.entityMap || {}

          const rtn: RawContentState = {
            blocks: [],
            entityMap: {},
          }

          let numberOfMeaningfulBlocks = 0
          const blocksLimit = 4
          for (let i = 0; i < blocks.length; i++) {
            if (numberOfMeaningfulBlocks > blocksLimit) {
              break
            }

            const block = blocks[i]

            // empty block: new line
            if (block?.text === '' && block?.type === 'unstyled') {
              rtn.blocks.push(block)
              continue
            }

            block?.entityRanges?.forEach((entityObj: { key: number }) => {
              const entityKey = entityObj?.key
              rtn.entityMap[entityKey] = entityMap[entityKey]
            })
            rtn.blocks.push(block)
            numberOfMeaningfulBlocks += 1
          }

          return rtn
        },
      }),
    }),
    content: customFields.richTextEditor({
      label: '內文',
      disabledButtons: [
        'header-four',
        'font-color',
        'text-align',
        'color-box',
        'background-color',
        'background-image',
        'background-video',
        'related-post',
        'side-index',
      ],
      website: 'mirrormedia',
      access: {
        read: ({
          context,
          item,
        }: {
          context: KeystoneContext
          item: Record<string, unknown>
        }) => {
          if (envVar.accessControlStrategy === 'gql') {
            // Post is not member only,
            // every request could access content field
            if (item?.isMember === false) {
              return true
            }

            // Post is member only.
            // Check request permission.
            const scope = context.req?.headers?.['x-access-token-scope']

            // get acl from scope
            const acl =
              typeof scope === 'string'
                ? scope.match(/read:member-posts:([^\s]*)/i)?.[1]
                : ''

            if (typeof acl !== 'string') {
              return false
            } else if (acl === 'all') {
              // scope contains 'read:memeber-posts:all'
              // the request has the permission to read this field
              return true
            } else {
              // scope contains 'read:member-posts:${postId1},${postId2},...,${postIdN}'
              const postIdArr = acl.split(',')

              // check the request has the permission to read this field
              if (postIdArr.indexOf(`${item.id}`) > -1) {
                return true
              }
            }

            return false
          }

          // the request has permission to read this field
          return true
        },
      },
    }),
    isMember: checkbox({
      label: '會員文章',
      defaultValue: false,
    }),
    memberFeed: checkbox({
      label: '會員文章Feed',
      defaultValue: false,
    }),
    topics: relationship({
      label: '專題',
      ref: 'Topic.posts',
      ui: {
        views: './lists/views/sorted-relationship/index',
      },
    }),
    related_posts: relationship({
      label: '相關文章',
      ref: 'Post',
      many: true,
    }),
    related_posts_order: json({
      label: '相關文章順序',
      ui: {
        views: './lists/views/related-posts-order/index',
      },
    }),
    relateds: relationship({
      label: '相關文章(雙向關聯)',
      ref: 'Post',
      many: true,
    }),
    from_External_relateds: relationship({
      label: '相關外部文章(發佈後由演算法自動計算)',
      isFilterable: false,
      ref: 'External.relateds',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    groups: relationship({
      label: '群組(發佈後由演算法自動計算)',
      isFilterable: false,
      ref: 'Group.posts',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    manualOrderOfRelateds: json({
      label: '相關文章手動排序結果',
      isFilterable: false,
      ui: {
        itemView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag.posts',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
      },
    }),
    tags_algo: relationship({
      label: '演算法標籤',
      isFilterable: false,
      ref: 'Tag.posts_algo',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    og_title: text({
      label: 'FB分享標題',
      validation: { isRequired: false },
    }),
    og_description: text({
      label: 'FB分享說明',
      isFilterable: false,
      validation: { isRequired: false },
    }),
    og_image: relationship({
      label: 'FB分享縮圖',
      isFilterable: false,
      ref: 'Photo',
      ui: {
        displayMode: 'cards',
        cardFields: ['imageFile'],
        linkToItem: true,
        inlineConnect: true,
        views: './lists/views/sorted-relationship/index',
      },
    }),
    related_videos: relationship({
      label: '相關影片',
      isFilterable: false,
      ref: 'Video.related_posts',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
      },
    }),
    manualOrderOfRelatedVideos: json({
      label: '相關影片手動排序結果',
      isFilterable: false,
    }),

    preview: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `${envVar.previewServer.path}/story/${item?.slug}`,
            label: 'Preview',
          }
        },
      }),
      ui: {
        // A module path that is resolved from where `keystone start` is run
        views: './lists/views/link-button',
        //createView: {
        //  fieldMode: 'hidden',
        //},
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    isFeatured: checkbox({
      label: '置頂',
      defaultValue: false,
    }),
    isAdvertised: checkbox({
      label: '廣告文案',
      defaultValue: false,
    }),
    hiddenAdvertised: checkbox({
      label: 'google廣告違規',
      defaultValue: false,
    }),
    isAdult: checkbox({
      label: '18禁',
      defaultValue: false,
    }),
    redirect: text({
      label: '廣編文轉址 slug',
    }),
    adTrace: text({
      label: '追蹤代碼',
      ui: { displayMode: 'textarea' },
    }),
    css: text({
      ui: { displayMode: 'textarea' },
      label: 'CSS',
    }),
    apiDataBrief: json({
      label: 'Brief資料庫使用',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    apiData: json({
      label: '資料庫使用',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
      access: {
        read: ({
          context,
          item,
        }: {
          context: KeystoneContext
          item: Record<string, unknown>
        }) => {
          if (envVar.accessControlStrategy === 'gql') {
            // Post is not member only,
            // every request could access content field
            if (item?.isMember === false) {
              return true
            }

            // Post is member only.
            // Check request permission.
            const scope = context.req?.headers?.['x-access-token-scope']

            // get acl from scope
            const acl =
              typeof scope === 'string'
                ? scope.match(/read:member-posts:([^\s]*)/i)?.[1]
                : ''

            if (typeof acl !== 'string') {
              return false
            } else if (acl === 'all') {
              // scope contains 'read:memeber-posts:all'
              // the request has the permission to read this field
              return true
            } else {
              // scope contains 'read:member-posts:${postId1},${postId2},...,${postIdN}'
              const postIdArr = acl.split(',')

              // check the request has the permission to read this field
              if (postIdArr.indexOf(`${item.id}`) > -1) {
                return true
              }
            }

            return false
          }

          // the request has permission to read this field
          return true
        },
      },
    }),
    trimmedApiData: virtual({
      label: '擷取apiData中的前五段內容',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
      field: graphql.field({
        type: graphql.JSON,
        resolve: async (
          item: Record<string, unknown>
        ): Promise<JSONValue | undefined> => {
          const apiData = item?.apiData
          if (Array.isArray(apiData)) {
            return apiData.slice(0, 5)
          } else {
            return undefined
          }
        },
      }),
    }),
  },
  ui: {
    labelField: 'slug',
    listView: {
      initialColumns: ['id', 'title', 'slug', 'state', 'publishedDate'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
    itemView: {
      defaultFieldMode: itemViewFunction,
    },
  },
  graphql: {
    cacheHint: { maxAge: 0, scope: 'PRIVATE' },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
    filter: {
      query: filterPosts([UserRole.Admin, UserRole.Moderator, UserRole.Editor]),
    },
  },
  hooks: {
    validateInput: async ({ operation, item, context, addValidationError }) => {
      if (context.session?.data?.role !== UserRole.Admin) {
        if (operation === 'update') {
          const { lockBy } = await context.prisma.Post.findUnique({
            where: { id: Number(item.id) },
            select: {
              lockBy: {
                select: {
                  id: true,
                },
              },
            },
          })

          if (
            lockBy?.id &&
            Number(lockBy.id) !== Number(context.session?.data?.id)
          ) {
            addValidationError('可能有其他人正在編輯，請重新整理頁面。')
          }
        }
      }
    },
    resolveInput: async ({ operation, resolvedData }) => {
      const { publishedDate, content, brief, updateTimeStamp } = resolvedData
      if (operation === 'create') {
        resolvedData.publishedDate = new Date(publishedDate.setSeconds(0, 0))
        resolvedData.updatedAt = new Date()
      }
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      if (brief) {
        resolvedData.apiDataBrief = customFields.draftConverter
          .convertToApiData(brief)
          .toJS()
      }
      if (updateTimeStamp) {
        const now = new Date()
        resolvedData.publishedDate = new Date(now.setSeconds(0, 0))
        resolvedData.updatedAt = new Date()
        resolvedData.updateTimeStamp = false
      }

      return resolvedData
    },
    beforeOperation: async ({ operation, resolvedData }) => {
      /* ... */
      if (operation === 'create' || operation === 'update') {
        if (resolvedData.slug) {
          resolvedData.slug = resolvedData.slug.trim()
          resolvedData.slug = resolvedData.slug.replace(' ', '_')
        }
        if (resolvedData.publishedDate) {
          /* check the publishedDate */
          if (resolvedData.publishedDate > Date.now()) {
            resolvedData.state = 'scheduled'
          }
          /* end publishedDate check */
          resolvedData.publishedDateString = new Date(
            resolvedData.publishedDate
          ).toLocaleDateString('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          return
        }
      }
      return
    },
    afterOperation: async ({ inputData, item, context }) => {
      // 取出 user 所設定的相關文章 related_posts
      const addTwoSidedConnection =
        (inputData?.related_posts?.connect as { id: string }[]) ?? []
      const removeTwoSidedConnection =
        (inputData?.related_posts?.disconnect as { id: string }[]) ?? []

      await context.db.Post.updateMany({
        data: [
          // 同步相關文章(雙向關聯) relateds
          ...addTwoSidedConnection.map(({ id }) => ({
            where: { id: `${item?.id}` },
            data: {
              relateds: {
                connect: [{ id }],
              },
            },
          })),
          ...removeTwoSidedConnection.map(({ id }) => ({
            where: { id: `${item?.id}` },
            data: {
              relateds: {
                disconnect: [{ id }],
              },
            },
          })),
          // 將 target 文章的 relateds 關聯回 current Post
          ...addTwoSidedConnection.map(({ id }) => ({
            where: { id },
            data: {
              relateds: {
                connect: [{ id: item?.id }],
              },
            },
          })),
          ...removeTwoSidedConnection.map(({ id }) => ({
            where: { id },
            data: {
              relateds: {
                disconnect: [{ id: item?.id }],
              },
            },
          })),
        ],
      })
    },
  },
})

let extendedListConfigurations = utils.addTrackingFields(listConfigurations)
if (typeof envVar.invalidateCDNCacheServerURL === 'string') {
  extendedListConfigurations = utils.invalidateCacheAfterOperation(
    extendedListConfigurations,
    `${envVar.invalidateCDNCacheServerURL}/story`,
    (item, originalItem) => ({
      slug: originalItem?.slug ?? item?.slug,
    })
  )
}

export default utils.addManualOrderRelationshipFields(
  [
    {
      fieldName: 'manualOrderOfWriters',
      targetFieldName: 'writers',
      targetListName: 'Contact',
      targetListLabelField: 'name',
    },
    {
      fieldName: 'manualOrderOfSections',
      targetFieldName: 'sections',
      targetListName: 'Section',
      targetListLabelField: 'name',
    },
    {
      fieldName: 'manualOrderOfCategories',
      targetFieldName: 'categories',
      targetListName: 'Category',
      targetListLabelField: 'name',
    },
    {
      fieldName: 'manualOrderOfRelateds',
      targetFieldName: 'relateds',
      targetListName: 'Post',
      targetListLabelField: 'title',
    },
    {
      fieldName: 'manualOrderOfRelatedVideos',
      targetFieldName: 'related_videos',
      targetListName: 'Video',
      targetListLabelField: 'name',
    },
  ],
  extendedListConfigurations
)
