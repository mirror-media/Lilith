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
import { ACL, UserRole, State, type Session } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum PostStatus {
  Published = State.Published,
  Draft = State.Draft,
  Scheduled = State.Scheduled,
  Archived = State.Archived,
  Invisible = State.Invisible,
}

function filterPosts(roles: string[]) {
  return ({ session }: { session?: Session }) => {
    switch (envVar.accessControlStrategy) {
      case ACL.GraphQL: {
        // Expose `published` and `invisible` posts
        return { state: { in: [PostStatus.Published, PostStatus.Invisible] } }
      }
      case ACL.Preview: {
        // Expose all posts
        return true
      }
      case ACL.CMS:
      default: {
        // Expose all posts if user logged in
        return (
          session?.data?.role !== undefined &&
          roles.indexOf(session.data.role) > -1
        )
      }
    }
  }
}

function checkReadPermission({
  context,
  item,
}: {
  context: KeystoneContext
  item: Record<string, unknown>
}) {
  if (envVar.accessControlStrategy === ACL.GraphQL) {
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
  const currentUserId = Number(session?.data?.id)
  const currentUserRole = session?.data?.role

  // @ts-ignore next line
  if ([UserRole.Moderator, UserRole.Editor].includes(currentUserRole)) {
    const { lockBy, lockExpireAt, createdBy } =
      await context.prisma.Post.findUnique({
        where: { id: Number(item.id) },
        select: {
          lockBy: {
            select: {
              id: true,
            },
          },
          lockExpireAt: true,
          createdBy: {
            select: {
              id: true,
            },
          },
        },
      })

    const newLockExpireAt = new Date(
      new Date().setMinutes(new Date().getMinutes() + envVar.lockDuration, 0, 0)
    ).toISOString()

    if (!lockBy) {
      if (createdBy) {
        if (
          Number(createdBy.id) !== currentUserId &&
          currentUserRole === UserRole.Editor
        ) {
          return 'read'
        }
      }

      const updatedPost = await context.prisma.Post.update({
        where: { id: Number(item.id) },
        data: {
          lockBy: {
            connect: {
              id: currentUserId,
            },
          },
          lockExpireAt: newLockExpireAt,
        },
        select: {
          lockBy: {
            select: {
              id: true,
            },
          },
        },
      })

      return Number(updatedPost.lockBy?.id) === Number(session?.data?.id)
        ? 'edit'
        : 'read'
    } else if (Number(lockBy.id) == Number(session?.data?.id)) {
      return 'edit'
    } else if (new Date(lockExpireAt).valueOf() < Date.now()) {
      // 過期的自動讓出，讓出對象為 Moderator 或者文章建立者
      if (
        currentUserRole === UserRole.Moderator ||
        currentUserId === Number(createdBy?.id)
      ) {
        const updatedPost = await context.prisma.Post.update({
          where: { id: Number(item.id) },
          data: {
            lockBy: {
              connect: {
                id: currentUserId,
              },
            },
            lockExpireAt: newLockExpireAt,
          },
          select: {
            lockBy: {
              select: {
                id: true,
              },
            },
          },
        })

        return Number(updatedPost.lockBy?.id) === Number(session?.data?.id)
          ? 'edit'
          : 'read'
      }
    }
    return 'hidden'
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
        //itemView: { fieldMode: 'read' },
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
    // TODO: slug field is deprecated, should be removed in the future
    slug: text({
      label: 'slug網址名稱（英文）',
      isFilterable: false,
      isOrderable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    title: text({
      label: '標題（建議字數：28字）',
      validation: { isRequired: true},
    }),
    subtitle: text({
      label: '副標',
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    sections: relationship({
      label: '大分類',
      ref: 'Section.posts',
      many: true,
      ui: {
        labelField: 'name',
        views: './lists/views/post/sections/index',
      },
    }),
    manualOrderOfSections: json({
      isFilterable: false,
      label: '大分類手動排序結果',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    categories: relationship({
      label: '小分類',
      ref: 'Category.posts',
      many: true,
      ui: {
        labelField: 'name',
      },
    }),
    manualOrderOfCategories: json({
      isFilterable: false,
      label: '小分類手動排序結果',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    writers: relationship({
      label: '作者',
      ref: 'Contact',
      many: true,
      ui: {
        views: './lists/views/post/contact-relationship/index',
      },
    }),
    manualOrderOfWriters: json({
      label: '作者手動排序結果',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    photographers: relationship({
      label: '攝影',
      ref: 'Contact',
      many: true,
      ui: {
        views: './lists/views/post/contact-relationship/index',
      },
    }),
    camera_man: relationship({
      label: '影音',
      ref: 'Contact',
      many: true,
      ui: {
        views: './lists/views/post/contact-relationship/index',
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    designers: relationship({
      label: '編輯',
      ref: 'Contact',
      many: true,
      ui: {
        views: './lists/views/post/contact-relationship/index',
        //createView: { fieldMode: 'hidden' },
        //listView: { fieldMode: 'hidden' },
        //itemView: { fieldMode: 'hidden' },
      },
    }),
    engineers: relationship({
      label: '工程',
      ref: 'Contact',
      many: true,
      ui: {
        views: './lists/views/post/contact-relationship/index',
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    vocals: relationship({
      label: '主播',
      ref: 'Contact',
      many: true,
      ui: {
        views: './lists/views/post/contact-relationship/index',
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    extend_byline: text({
      label: '作者（其他）',
      validation: { isRequired: false },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    heroVideo: relationship({
      label: '首圖影片（Leading Video）',
      ref: 'Video',
      ui: {
        views: './lists/views/sorted-relationship/index',
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        displayMode: 'cards',
        cardFields: ['imageFile'],
        //linkToItem: true,
        inlineCreate: {
          fields: ['name', 'imageFile', 'waterMark'],
        },
        inlineConnect: true,
        views: './lists/views/sorted-relationship/index',
      },
    }),
    defaultHeroImage: relationship({
      label: '首圖預設圖(選擇此項後，請不要再選首圖)',
      ref: 'Photo',
      many: false,
      ui: {
        displayMode: 'cards',
        cardFields: ['imageFile'],
        //linkToItem: true,
        inlineCreate: {
          fields: ['name', 'imageFile', 'waterMark'],
        },
        inlineConnect: true,
        views: './lists/views/post/default-hero-image/index',
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
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    brief: customFields.richTextEditor({
      label: '前言',
      disabledButtons: [
        'code',
        'bold',
        'italic',
        'underline',
        'header-two',
        'header-three',
        'header-four',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'code-block',
        'link',
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
        listView: { fieldMode: 'hidden' },
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
        'background-color',
        'background-image',
        'background-video',
        'color-box',
        'font-color',
        'header-four',
        'related-post',
        'side-index',
        'text-align',
      ],
      hideOnMobileButtons: [
        'annotation',
        'unordered-list-item',
        'ordered-list-item',
        'header-three',
        'audio',
        'blockquote',
        'code',
        'code-block',
        'divider',
        'embed',
        'info-box',
        'link',
        'slideshow',
        'table',
        'youtube',
      ],
      website: 'mirrordaily',
      access: {
        read: checkReadPermission,
      },
    }),
    isMember: checkbox({
      label: '會員文章',
      defaultValue: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    topics: relationship({
      label: '專題',
      ref: 'Topic.posts',
      ui: {
        views: './lists/views/sorted-relationship/index',
        labelField: 'name',
      },
    }),
    relateds: relationship({
      label: '相關文章',
      ref: 'Post',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship-filter-draft-selfpost/index',
        labelField: 'title',
      }
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
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
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
      ref: 'Tag.posts_algo',
      many: true,
      ui: {
        views: './lists/views/sorted-relationship/index',
        createView: { fieldMode: 'hidden' },
        //itemView: { fieldMode: 'hidden' },
        //listView: { fieldMode: 'hidden' },
      },
    }),
    og_title: text({
      label: 'FB分享標題',
      validation: { isRequired: false },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    og_description: text({
      label: 'FB分享說明',
      isFilterable: false,
      validation: { isRequired: false },
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    og_image: relationship({
      label: 'FB分享縮圖',
      isFilterable: false,
      ref: 'Photo',
      ui: {
        displayMode: 'cards',
        cardFields: ['imageFile'],
        //linkToItem: true,
        inlineCreate: {
          fields: ['name', 'imageFile', 'waterMark'],
        },
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
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    manualOrderOfRelatedVideos: json({
      label: '相關影片手動排序結果',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: PostStatus.Draft },
        { label: '已發布', value: PostStatus.Published },
        { label: '預約發佈', value: PostStatus.Scheduled },
        { label: '下線', value: PostStatus.Archived },
        { label: '前台不可見', value: PostStatus.Invisible },
      ],
      defaultValue: PostStatus.Draft,
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
      defaultValue: true,
    }),

    preview: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `${envVar.previewServer.path}/story/${item?.id}`,
            label: 'Preview',
          }
        },
      }),
      ui: {
        // A module path that is resolved from where `keystone start` is run
        views: './lists/views/link-button',
        createView: {
          fieldMode: 'hidden',
        },
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    isFeatured: checkbox({
      label: '置頂',
      defaultValue: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    isAdvertised: checkbox({
      label: '廣告文案',
      defaultValue: false,
      ui: {
        //createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    hiddenAdvertised: checkbox({
      label: 'google廣告違規',
      defaultValue: false,
      ui: {
        //createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    isAdult: checkbox({
      label: '18禁',
      defaultValue: false,
    }),
    Warning: relationship({
      ref: 'Warning',
      many: false,
      label: '警語',
      ui: {
        displayMode: 'select',
      },
    }),
    redirect: text({
      label: '廣編文轉址 slug',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    adTrace: text({
      label: '追蹤代碼',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    css: text({
      label: 'CSS',
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        displayMode: 'textarea',
      },
    }),
    apiDataBrief: json({
      label: 'Brief資料庫使用',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    apiData: json({
      label: '資料庫使用',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
      access: {
        read: checkReadPermission,
      },
    }),
    trimmedApiData: virtual({
      label: '擷取apiData中的前五段內容',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
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
    labelField: 'id',
    listView: {
      initialColumns: ['id', 'title', 'state', 'publishedDate'],
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
      update: async (auth) => {
        if (admin(auth) || moderator(auth)) return true
        else {
          // editor only allow to update posts created by itself
          return {
            createdBy: {
              id: {
                equals: auth.session.data.id,
              },
            },
          }
        }
      },
    },
  },
  hooks: {
    validateInput: async ({ operation, item, context, addValidationError }) => {
      if (context.session?.data?.role !== UserRole.Admin) {
        if (operation === 'update') {
          const { lockBy, lockExpireAt } = await context.prisma.Post.findUnique(
            {
              where: { id: Number(item.id) },
              select: {
                lockBy: {
                  select: {
                    id: true,
                  },
                },
                lockExpireAt: true,
              },
            }
          )

          if (
            lockBy?.id &&
            Number(lockBy.id) !== Number(context.session?.data?.id) &&
            new Date(lockExpireAt).valueOf() > Date.now()
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
      if (
        (operation === 'create' || operation === 'update') &&
        resolvedData.defaultHeroImage &&
        Object.hasOwn(resolvedData.defaultHeroImage, 'connect')
        // 限制更新回 heroImage 的行為僅在新增或更改 defaultHeroImage 的情況
      ) {
        resolvedData.heroImage = resolvedData.defaultHeroImage
      }
      return resolvedData
    },
    beforeOperation: async ({ operation, resolvedData }) => {
      /* ... */
      if (operation === 'create' || operation === 'update') {
        // if (resolvedData.slug) {
        //   resolvedData.slug = resolvedData.slug.trim()
        //   resolvedData.slug = resolvedData.slug.replace(' ', '_')
        // }
        if (resolvedData.publishedDate) {
          /* check the publishedDate */
          if (resolvedData.publishedDate > Date.now()) {
            resolvedData.state = PostStatus.Scheduled
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
    afterOperation: async ({ operation, item, context }) => {
	  console.log("check the afterOperation")
      if (
        resolvedData &&
        resolvedData.state &&
        resolvedData.state === 'published'
      ) {
	    console.log("call data service")
        // trigger auto tagging service
        const result = fetch(envVar.dataServiceApi + '?id=' + item.id, {
          method: 'GET',
        })
      }
      if (operation === 'update') {
        await context.prisma.post.update({
          where: { id: Number(item.id) },
          data: {
            lockBy: { disconnect: true },
            lockExpireAt: null,
          },
        })
      }
    },
  },
})

let extendedListConfigurations = utils.addTrackingFields(listConfigurations)

if (typeof envVar.invalidateCDNCacheServerURL === 'string') {
  extendedListConfigurations = utils.invalidateCacheAfterOperation(
    extendedListConfigurations,
    `${envVar.invalidateCDNCacheServerURL}/story`,
    (item, originalItem) => ({
      slug: originalItem?.id ?? item?.id,
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
