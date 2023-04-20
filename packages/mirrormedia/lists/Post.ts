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
// @ts-ignore @twreporter/errors does not have typescript definition
import errors from '@twreporter/errors'
// @ts-ignore draft-js does not have typescript definition
import { RawContentState } from 'draft-js'
import logUtils from '../utils/gcp-logging'

const { allowRoles, admin, moderator } = utils.accessControl

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

function filterPosts(roles: string[]) {
  return ({ session }: { session: Session }) => {
    switch (envVar.accessControlStrategy) {
      case 'gql': {
        // Only expose `published` posts
        return { state: { equals: PostStatus.Published } }
      }
      case 'preview': {
        // Expose all posts, including `published`, `draft` and `archived` posts
        return true
      }
      case 'cms':
      default: {
        // Expose all posts, including `published`, `draft` and `archived` posts if user logged in
        return roles.indexOf(session?.data?.role) > -1
      }
    }
  }
}

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'slug網址名稱（英文）',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    title: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    subtitle: text({
      label: '副標',
      validation: { isRequired: false },
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
      label: '發佈日期',
    }),
    sections: relationship({
      label: '大分類',
      ref: 'Section.posts',
      many: true,
    }),
    manualOrderOfSections: json({
      label: '大分類手動排序結果',
    }),
    categories: relationship({
      label: '小分類',
      ref: 'Category.posts',
      many: true,
    }),
    writers: relationship({
      label: '作者',
      ref: 'Contact',
      many: true,
    }),
    manualOrderOfWriters: json({
      label: '作者手動排序結果',
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
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
    }),
    heroCaption: text({
      label: '首圖圖說',
      validation: { isRequired: false },
    }),
    heroImageSize: select({
      label: '首圖尺寸',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Wide', value: 'wide' },
        { label: 'Small', value: 'small' },
      ],
      defaultValue: 'normal',
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
      disabledButtons: [],
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
      disabledButtons: [],
      website: 'mirrormedia',
      access: {
        read: async ({
          context,
          item,
        }: {
          context: KeystoneContext
          item: Record<string, unknown>
        }) => {
          if (envVar.accessControlStrategy === 'gql') {
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

            let post
            const queryArgs = {
              where: { id: `${item.id}` },
              query: 'categories { isMemberOnly }',
            }
            try {
              // Due to many-to-many relationship,
              // `item` won't contain `categories` value.
              // Therefore, we have to query `categories`
              // object by ourselves.
              post = await context.query.Post.findOne(queryArgs)
            } catch (err) {
              const wrappedErr = errors.helpers.wrap(
                err,
                'QueryAPIError',
                'Error to query post item by Keystone Query API',
                queryArgs
              )
              console.log(
                JSON.stringify({
                  severity: 'Error',
                  message: errors.helpers.printAll(
                    wrappedErr,
                    {
                      withStack: true,
                      withPayload: true,
                    },
                    0,
                    0
                  ),
                  ...logUtils.getGlobalLogFields(
                    context.req,
                    envVar.gcp.projectId
                  ),
                })
              )
              // access denial due to unexpected error
              return false
            }

            const memberCategory = post?.categories?.find(
              (c: { isMemberOnly: boolean }) => {
                return c.isMemberOnly
              }
            )

            // the request does not have permission to read this field if the post is premiun post
            return memberCategory ? false : true
          }

          // the request has permission to read this field
          return true
        },
      },
    }),
    topics: relationship({
      label: '專題',
      ref: 'Topic.posts',
    }),
    titleColor: select({
      label: '標題模式',
      options: [
        { label: 'light', value: 'light' },
        { label: 'dark', value: 'dark' },
      ],
      defaultValue: 'light',
    }),
    relateds: relationship({
      label: '相關文章',
      ref: 'Post',
      many: true,
    }),
    manualOrderOfRelateds: json({
      label: '相關文章手動排序結果',
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag.posts',
      many: true,
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
    isMember: checkbox({
      label: '會員文章',
      defaultValue: false,
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
    isCampaign: checkbox({
      label: '活動',
      defaultValue: false,
    }),
    isAdult: checkbox({
      label: '18禁',
      defaultValue: false,
    }),
    lockJS: checkbox({
      label: '鎖定右鍵',
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
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
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
    labelField: 'slug',
    listView: {
      initialColumns: ['id', 'slug', 'state'],
      initialSort: { field: 'publishedDate', direction: 'DESC' },
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
      query: filterPosts([UserRole.Admin, UserRole.Moderator, UserRole.Editor]),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { content, brief } = resolvedData
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
      return resolvedData
    },
  },
})
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
      fieldName: 'manualOrderOfRelateds',
      targetFieldName: 'relateds',
      targetListName: 'Post',
      targetListLabelField: 'title',
    },
  ],
  utils.addTrackingFields(listConfigurations)
)
