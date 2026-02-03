import { list } from '@keystone-6/core'
import { graphql } from '@keystone-6/core'
import { utils, customFields } from '@mirrormedia/lilith-core'
import {
  text,
  relationship,
  select,
  checkbox,
  timestamp,
  json,
  virtual,
} from '@keystone-6/core/fields'
import envVar from '../environment-variables'

const { allowRoles, admin, moderator, editor, contributor, owner } =
  utils.accessControl

enum UserRole {
  Admin = 'admin',
  Moderator = 'moderator',
  Editor = 'editor',
  Contributor = 'contributor',
}

enum PostState {
  Draft = 'draft',
  Published = 'published',
  Scheduled = 'scheduled',
  Archived = 'archived',
  Invisible = 'invisible',
}

// --- Helpers ---
function removeControlCharacter(value: string) {
  // eslint-disable-next-line no-control-regex
  const controlChars = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g
  return value.replace(controlChars, '')
}

function handleGenerateSource(
  item: Record<string, any> | undefined,
  resolvedData: Record<string, any>
) {
  const updateSourceViaPostStyle = resolvedData.style && item
  const isNotCreatedByBot = !resolvedData.source && !item

  if (updateSourceViaPostStyle || isNotCreatedByBot) {
    const postStyle = resolvedData.style || 'article'
    let source = 'tv'
    if (postStyle === 'videoNews') source = 'yt'
    resolvedData.source = source
  }
}

function filterPosts(roles: UserRole[]) {
  return ({ session }: { session?: Record<string, any> }) => {
    switch (envVar.accessControlStrategy) {
      case 'gql':
        return { state: { in: [PostState.Published, PostState.Invisible] } }
      case 'preview':
        return true
      case 'cms':
      default:
        if (!session?.data?.role)
          return { state: { in: [PostState.Published] } }

        if (roles.includes(session.data.role)) {
          return true
        }

        return { state: { in: [PostState.Published] } }
    }
  }
}

// 文章鎖定機制
const itemViewFunction = async ({
  session,
  context,
  item,
}: {
  session: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
  item: Record<string, any>
}) => {
  const userRole = session?.data?.role
  if (userRole === UserRole.Editor || userRole === UserRole.Contributor) {
    const { lockBy } = await context.prisma.Post.findUnique({
      where: { id: Number(item.id) },
      select: { lockBy: { select: { id: true } } },
    })

    if (!lockBy || Number(lockBy.id) === Number(session.data.id)) {
      const lockExpireAt = new Date(
        Date.now() + (envVar.lockDuration || 30) * 60 * 1000
      ).toISOString()
      if (!lockBy) {
        await context.prisma.Post.update({
          where: { id: Number(item.id) },
          data: {
            lockBy: { connect: { id: Number(session.data.id) } },
            lockExpireAt,
          },
        })
      }
      return 'edit'
    }
    return 'read'
  }
  return 'edit'
}

const listConfigurations = list({
  fields: {
    // --- Basic Fields ---
    slug: text({
      label: 'Slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    name: text({
      label: '標題',
      validation: { isRequired: true },
      defaultValue: 'untitled',
    }),

    label: virtual({
      label: '關聯顯示 (Slug + Name)',
      field: graphql.field({
        type: graphql.String,
        resolve: (item: Record<string, any>) => {
          const slug = item.slug || ''
          const name = item.name ? `【${item.name}】` : ''
          return `${slug} ${name}`.trim()
        },
      }),
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),

    subtitle: text({ label: '副標' }),
    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: PostState.Draft },
        { label: 'Published', value: PostState.Published },
        { label: 'Scheduled', value: PostState.Scheduled },
        { label: 'Archived', value: PostState.Archived },
        { label: 'Invisible', value: PostState.Invisible },
      ],
      defaultValue: PostState.Draft,
      isIndexed: true,
      access: {
        create: allowRoles(admin, moderator, editor),
        update: allowRoles(admin, moderator, editor),
      },
    }),
    publishTime: timestamp({
      label: '發佈時間',
      isIndexed: true,
      isFilterable: true,
      defaultValue: { kind: 'now' },
    }),
    publishedDateString: text({
      label: '發布日期(字串)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    updateTimeStamp: checkbox({
      label: '下次存檔時自動更改成「現在時間」',
      isFilterable: false,
      defaultValue: true,
    }),

    // --- Relations ---
    categories: relationship({ label: '分類', ref: 'Category', many: true }),
    writers: relationship({ label: '作者', ref: 'Contact', many: true }),
    manualOrderOfWriters: json({
      label: '作者手動排序結果',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),

    photographers: relationship({ label: '攝影', ref: 'Contact', many: true }),
    cameraOperators: relationship({
      label: '影音',
      ref: 'Contact',
      many: true,
    }),
    designers: relationship({ label: '設計', ref: 'Contact', many: true }),
    engineers: relationship({ label: '工程', ref: 'Contact', many: true }),
    vocals: relationship({ label: '主播', ref: 'Contact', many: true }),
    otherbyline: text({ label: '作者（其他）' }),

    heroVideo: relationship({ label: '影片', ref: 'Video' }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Image',
      ui: {
        displayMode: 'cards',
        cardFields: ['file'],
        inlineCreate: {
          fields: ['name', 'file'],
        },
        inlineConnect: true,
      },
    }),
    heroCaption: text({ label: '首圖圖說' }),
    heroImageSize: select({
      label: '首圖尺寸',
      options: [
        { label: 'Extend', value: 'extend' },
        { label: 'Normal', value: 'normal' },
        { label: 'Small', value: 'small' },
      ],
      defaultValue: 'normal',
    }),
    style: select({
      label: '樣式',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Video News', value: 'videoNews' },
        { label: 'Wide', value: 'wide' },
        { label: 'Projects', value: 'projects' },
        { label: 'Photography', value: 'photography' },
        { label: 'Script', value: 'script' },
        { label: 'Campaign', value: 'campaign' },
        { label: 'Readr', value: 'readr' },
      ],
      defaultValue: 'article',
    }),

    // --- Rich Text ---
    brief: customFields.richTextEditor({
      label: '前言',
      website: 'mirrortv',
      disabledButtons: [
        'header-four',
        'code-block',
        'table',
        'divider',
        'related-post',
        'color-box',
        'background-color',
        'background-image',
        'background-video',
        'side-index',
        'text-align',
      ],
    }),
    content: customFields.richTextEditor({
      label: '內文',
      website: 'mirrortv',
      disabledButtons: [
        'header-four',
        'code-block',
        'table',
        'related-post',
        'color-box',
        'divider',
        'background-color',
        'background-image',
        'background-video',
        'side-index',
        'text-align',
      ],
    }),

    // --- Hidden API Data ---
    briefHtml: text({
      label: 'Brief HTML',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    briefApiData: json({
      label: 'Brief API Data',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    contentHtml: text({
      label: 'Content HTML',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    contentApiData: json({
      label: 'Content API Data',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    source: text({
      label: '來源',
      ui: {
        itemView: { fieldMode: 'read' },
        createView: { fieldMode: 'hidden' },
      },
    }),

    // --- Others ---
    topics: relationship({
      label: '專題',
      ref: 'Topic',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    tags: relationship({ label: '標籤', ref: 'Tag', many: true }),
    audio: relationship({ label: '音檔', ref: 'Audio' }),
    download: relationship({ label: '附加檔案', ref: 'Download', many: true }),

    relatedPosts: relationship({ label: '相關文章', ref: 'Post', many: true }),
    manualOrderOfRelatedPosts: json({
      label: '相關文章手動排序結果',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),

    relatedTopic: relationship({
      label: '相關專題',
      ref: 'Topic',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    ogTitle: text({ label: 'FB 分享標題' }),
    ogDescription: text({ label: 'FB 分享說明' }),
    ogImage: relationship({ label: 'FB 分享縮圖', ref: 'Image' }),

    adTraceCode: text({ label: '追蹤代碼', ui: { displayMode: 'textarea' } }),
    notFeed: checkbox({ label: '不供稿給週刊' }),
    exclusive: checkbox({ label: '獨家' }),
    isFeatured: checkbox({ label: '置頂' }),
    isAdult: checkbox({ label: '18禁' }),
    isAdvertised: checkbox({ label: '廣告文案' }),
    isAdBlocked: checkbox({ label: 'Google 廣告違規' }),
    lockTime: timestamp({
      label: '鎖定時間',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    // --- Locking Fields (MM) ---
    lockBy: relationship({
      ref: 'User',
      label: '誰正在編輯',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
        displayMode: 'cards',
        cardFields: ['name'],
      },
    }),
    lockExpireAt: timestamp({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),

    // Virtual Field (擷取前 5 段 API Data)
    trimmedApiData: virtual({
      label: '擷取apiData中的前五段內容',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
      field: graphql.field({
        type: graphql.JSON,
        resolve: async (item: Record<string, any>) => {
          const apiData = item?.contentApiData
          if (Array.isArray(apiData)) {
            return apiData.slice(0, 5)
          }
          return undefined
        },
      }),
    }),
  },

  ui: {
    labelField: 'label',

    listView: {
      initialColumns: ['slug', 'name', 'state', 'categories', 'publishTime'],
      initialSort: { field: 'publishTime', direction: 'DESC' },
      pageSize: 50,
    },
    searchFields: ['name', 'slug'],

    itemView: {
      defaultFieldMode: itemViewFunction,
    },
  },

  graphql: {
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor, owner),
      update: allowRoles(admin, moderator, owner),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
    filter: {
      query: filterPosts([
        UserRole.Admin,
        UserRole.Moderator,
        UserRole.Editor,
        UserRole.Contributor,
      ]),
    },
  },

  hooks: {
    resolveInput: async ({ resolvedData, item }) => {
      // 清理控制字元
      for (const key in resolvedData) {
        if (typeof resolvedData[key] === 'string') {
          resolvedData[key] = removeControlCharacter(resolvedData[key])
        }
      }

      // RichText 轉換 (DraftJS -> HTML/API Data)
      if (resolvedData.brief) {
        try {
          resolvedData.briefApiData = customFields.draftConverter
            .convertToApiData(resolvedData.brief)
            .toJS()
          // resolvedData.briefHtml = customFields.draftConverter.convertToHtml(
          //   resolvedData.brief
          // )
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '發生未知錯誤'
          console.error('[Error] Brief 轉換失敗:', message)
        }
      }
      if (resolvedData.content) {
        try {
          resolvedData.contentApiData = customFields.draftConverter
            .convertToApiData(resolvedData.content)
            .toJS()
          // resolvedData.contentHtml = customFields.draftConverter.convertToHtml(
          //   resolvedData.content
          // )
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '發生未知錯誤'
          console.error('[Error] Content 轉換失敗，原因:', message)

          resolvedData.contentApiData = []
          resolvedData.contentHtml = ''
        }
      }

      // 清理 HTML 中的控制字元
      if (resolvedData.briefHtml)
        resolvedData.briefHtml = removeControlCharacter(resolvedData.briefHtml)
      if (resolvedData.contentHtml)
        resolvedData.contentHtml = removeControlCharacter(
          resolvedData.contentHtml
        )

      // publishTime
      const { updateTimeStamp, publishTime } = resolvedData
      if (updateTimeStamp === true) {
        const now = new Date()
        now.setSeconds(0, 0)
        resolvedData.publishTime = now.toISOString()
        resolvedData.updateTimeStamp = false
      } else if (publishTime) {
        const customDate = new Date(publishTime)
        customDate.setSeconds(0, 0)
        resolvedData.publishTime = customDate.toISOString()
      }

      // 生成 Source
      handleGenerateSource(item, resolvedData)

      // Slug 格式化
      if (resolvedData.slug) {
        resolvedData.slug = resolvedData.slug.trim().replace(/\s+/g, '_')
      }

      return resolvedData
    },

    validateInput: async ({
      resolvedData,
      item,
      addValidationError,
      context,
      operation,
    }) => {
      // 權限檢查
      if (operation === 'update' && item?.state === 'published') {
        if (context.session?.data?.role === 'contributor') {
          addValidationError("You don't have the permission")
          return
        }
      }

      // 檢查 Scheduled 狀態
      const state = resolvedData.state ?? item?.state
      const publishTime = resolvedData.publishTime ?? item?.publishTime

      if (state === PostState.Scheduled) {
        if (!publishTime) {
          addValidationError('若狀態為 "Scheduled"，請填寫發佈時間')
        } else {
          const now = new Date()
          const pubTimeDate = new Date(publishTime)
          if (pubTimeDate.getTime() < now.getTime() - 5 * 60 * 1000) {
            addValidationError('Scheduled 的發佈時間不能早於當下時間')
          }
        }
      }

      // 檢查鎖定狀態 (Update only)
      if (
        operation === 'update' &&
        context.session?.data?.role !== UserRole.Admin
      ) {
        const currentItem = await context.prisma.Post.findUnique({
          where: { id: Number(item.id) },
          select: { lockBy: { select: { id: true } } },
        })
        const lockById = currentItem?.lockBy?.id
        if (
          lockById &&
          Number(lockById) !== Number(context.session?.data?.id)
        ) {
          addValidationError('可能有其他人正在編輯，請重新整理頁面。')
        }
      }
    },

    beforeOperation: async ({ operation, resolvedData }) => {
      if (operation === 'create' || operation === 'update') {
        if (resolvedData.slug) {
          resolvedData.slug = resolvedData.slug.trim().replace(/\s+/g, '_')
        }

        if (resolvedData.publishTime) {
          const pubDate = new Date(resolvedData.publishTime)
          if (pubDate.getTime() > Date.now()) {
            resolvedData.state = PostState.Scheduled
          }
          // 更新 publishedDateString
          resolvedData.publishedDateString = pubDate.toLocaleDateString(
            'zh-TW',
            {
              timeZone: 'Asia/Taipei',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }
          )
        }
      }
    },

    afterOperation: async ({
      operation,
      item,
      context,
      resolvedData,
      originalItem,
    }) => {
      if (
        operation === 'create' ||
        operation === 'update' ||
        operation === 'delete'
      ) {
        try {
          const editorName = context.session?.data?.name || '未知用戶'
          const targetId =
            item?.id || (originalItem as any)?.id || (resolvedData as any)?.id
          if (!targetId) {
            console.warn('[EditLog] 無法取得目標 ID，取消紀錄')
            return
          }

          // 定義抓取欄位
          const fullQuery = `
            id slug name subtitle state publishTime publishedDateString
            otherbyline heroCaption heroImageSize style source
            ogTitle ogDescription adTraceCode notFeed exclusive
            isFeatured isAdult isAdvertised isAdBlocked
            brief content
            categories { id name } writers { id name } photographers { id name }
            cameraOperators { id name } designers { id name } engineers { id name }
            vocals { id name } heroVideo { id name } heroImage { id name }
            topics { id name } tags { id name } audio { id name }
            download { id name } relatedPosts { id name } relatedTopic { id name }
            ogImage { id name }
          `

          const fullNewItem =
            operation !== 'delete'
              ? ((await context.sudo().query.Post.findOne({
                  where: { id: String(targetId) },
                  query: fullQuery,
                })) as Record<string, any>)
              : null

          const oldItemBase = (originalItem as Record<string, any>) || {}

          const formatValueForLog = (val: any) => {
            if (val === undefined || val === null) return null

            // 處理 Many Relationship
            if (Array.isArray(val)) {
              if (val.length === 0) return null
              return val.map((v: any) => v.name || v.id || v).join(',')
            }

            // 處理 Single Relationship
            if (typeof val === 'object') {
              if (val.name) return val.name
              if (val.id) return val.id
              return JSON.stringify(val)
            }
            return String(val)
          }

          const safeParse = (data: any) => {
            if (!data) return undefined
            if (typeof data === 'object') return data
            try {
              return JSON.parse(data)
            } catch (e) {
              return undefined
            }
          }

          const editedData: Record<string, any> = {}
          const blackList = [
            'id',
            'briefHtml',
            'briefApiData',
            'contentHtml',
            'contentApiData',
            'updatedAt',
            'createdAt',
            'manualOrderOfWriters',
            'manualOrderOfRelatedPosts',
            'updateTimeStamp',
            'lockBy',
            'lockExpireAt',
            'trimmedApiData',
          ]

          let briefObject: any = undefined
          let contentObject: any = undefined

          if (operation === 'update') {
            const newItem = fullNewItem || {}
            // 比對有異動的欄位
            Object.keys(resolvedData || {}).forEach((key) => {
              if (
                blackList.includes(key) ||
                key === 'brief' ||
                key === 'content'
              )
                return

              const oldValue = formatValueForLog(oldItemBase[key])
              const newValue = formatValueForLog(newItem[key])

              if (oldValue !== newValue) {
                editedData[key] = newValue ?? 'null'
              }
            })
            briefObject = newItem.brief
            contentObject = newItem.content
          } else {
            // Create 或 Delete: 紀錄當下所有欄位
            const target =
              operation === 'delete' ? oldItemBase : fullNewItem || {}
            Object.keys(target).forEach((key) => {
              if (
                blackList.includes(key) ||
                key === 'brief' ||
                key === 'content'
              )
                return
              editedData[key] = formatValueForLog(target[key])
            })
            briefObject = target.brief
            contentObject = target.content
          }

          if (
            operation === 'update' &&
            Object.keys(editedData).length === 0 &&
            !resolvedData.brief &&
            !resolvedData.content
          ) {
            return
          }

          const postSlug =
            operation === 'delete'
              ? oldItemBase?.slug || oldItemBase?.name || String(targetId)
              : fullNewItem?.slug || fullNewItem?.name || String(targetId)

          // 寫入 EditLog
          await context.sudo().query.EditLog.createOne({
            data: {
              name: editorName,
              operation: operation,
              postSlug: String(postSlug),
              brief: safeParse(briefObject),
              content: safeParse(contentObject),
              changedList: JSON.stringify(editedData),
            },
          })

          console.log(`[EditLog] ${operation} 成功紀錄: ${postSlug}`)
        } catch (err) {
          console.error(`[EditLog] ${operation} 發生錯誤:`, err)
        }
      }

      // MM 的邏輯: 更新後解鎖
      if (operation === 'update' && item) {
        await context.prisma.Post.update({
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
      slug: originalItem?.slug ?? item?.slug,
    })
  )
}

// 啟用手動排序功能
export default utils.addManualOrderRelationshipFields(
  [
    /*
    {
      fieldName: 'manualOrderOfWriters',
      targetFieldName: 'writers',
      targetListName: 'Contact',
      targetListLabelField: 'name',
    },
    */
    {
      fieldName: 'manualOrderOfRelatedPosts',
      targetFieldName: 'relatedPosts',
      targetListName: 'Post',
      targetListLabelField: 'name', // K5 Post label is 'name'
    },
  ],
  extendedListConfigurations
)
