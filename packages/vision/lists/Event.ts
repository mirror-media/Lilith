import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  integer,
  text,
  relationship,
  select,
  json,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({ label: '名稱' }),
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: {
        isRequired: true,
      },
    }),
    weight: integer({
      label: '權重',
    }),
    register_start: timestamp({
      label: '報名開始時間',
    }),
    register_end: timestamp({
      label: '報名結束時間',
      validation: {
        isRequired: true,
      },
    }),
    event_start: timestamp({
      label: '活動開始時間',
    }),
    event_end: timestamp({
      label: '活動結束時間',
    }),
    category: relationship({
      label: 'Group',
      ref: 'Group.events',
      ui: {
        hideCreate: true,
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    venue: text({
      label: '地點',
    }),
    location: text({
      label: '地址',
    }),
    map_embed: text({
      label: '地圖 embed code',
    }),
    content: customFields.richTextEditor({
      label: '活動介紹',
    }),
    status: select({
      label: '狀態',
      options: [
        { label: '報名中', value: 'progress' },
        { label: '已結束', value: 'closed' },
      ],
    }),
    type: select({
      label: '類型',
      options: [
        { label: '行動', value: 'action' },
        { label: '徵稿', value: 'submission' },
      ],
    }),
    register_link: text({
      label: '報名連結',
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
      many: false,
    }),
    ref_posts: relationship({
      label: '相關文章',
      ref: 'Post.ref_events',
      ui: {
        hideCreate: true,
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    host: text({
      label: '主辦單位名稱',
    }),
    hosted_type: text({
      label: '單位（一）類型',
      defaultValue: '主辦單位',
    }),
    hosted_logo: customFields.relationship({
      label: '單位一（LOGO）',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
      many: true,
    }),
    hosted_type2: text({
      label: '單位（二）類型',
      defaultValue: '協辦單位',
    }),
    hosted_logo2: customFields.relationship({
      label: '單位二（LOGO）',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
      many: true,
    }),
    hosted_type3: text({
      label: '單位（三）類型',
      defaultValue: '承辦單位',
    }),
    hosted_logo3: customFields.relationship({
      label: '單位三（LOGO）',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
      many: true,
    }),
    previewButton: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>): string {
          return `/event/${item?.slug}`
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
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
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

export default utils.addTrackingFields(listConfigurations)
