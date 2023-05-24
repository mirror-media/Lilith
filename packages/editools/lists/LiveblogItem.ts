import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  json,
  checkbox,
  virtual,
  timestamp,
} from '@keystone-6/core/fields'
import { saveLiveblogJSON } from './utils'
import { graphql } from '@graphql-ts/schema'
import axios from 'axios'
import cheerio from 'cheerio'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    status: select({
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'draft',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    publishTime: timestamp({
      label: '發布時間',
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
    }),
    heroVideo: relationship({
      label: '首屏影片',
      ref: 'Video',
    }),
    imageCaption: text({
      label: '首圖圖說',
      ui: {
        displayMode: 'textarea',
      },
    }),
    type: select({
      options: [
        { label: '外連', value: 'external' },
        { label: '文章', value: 'article' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'article',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    author: text({
      label: '作者',
    }),
    name: customFields.richTextEditor({
      label: '內文',
      disabledButtons: [],
      website: 'readr',
    }),
    boost: checkbox({
      label: '置頂',
      dfaultValue: false,
    }),
    external: text({
      label: '外連連結',
    }),
    externalCoverPhoto: virtual({
      label: '外連連結首圖',
      field: graphql.field({
        type: graphql.String,
        async resolve(item: Record<string, unknown>) {
          const { external } = item || {}
          if (external && typeof external === 'string') {
            try {
              const result = await axios.get(external)
              if (result?.data) {
                const $ = cheerio.load(result.data)
                return $('meta[property="og:image"]').attr('content')
              }
            } catch (error) {
              console.log(
                JSON.stringify({ severity: 'ERROR', message: error.stack })
              )
              return ''
            }
          } else {
            return ''
          }
        },
      }),
    }),
    liveblog: relationship({
      ref: 'Liveblog.liveblog_items',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    tags: relationship({
      ref: 'Tag.liveblog_items',
      ui: {
        cardFields: ['name'],
        inlineCreate: { fields: ['name'] },
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
      },
      many: true,
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
    // 為了讓ref到post的其他list在relationship field中能看見「slug」而非「name」
    // 此處將list的主要labelField設定成slug（預設為name）
    // 註：在他處的relationship中應該也能設定要顯示的labelField，但不知為何無作用
    // 註：若未來想要顯示[slug+標題]的格式，官方建議可用virturl field實作並在此處apply
    listView: {
      initialColumns: ['title', 'liveblog', 'status', 'createdBy'],
      initialSort: { field: 'name', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'title',
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
      const { name } = resolvedData
      if (name) {
        const apiData = customFields.draftConverter
          .convertToApiData(name)
          .toJS()
        resolvedData.apiData = apiData
      }
      return resolvedData
    },
    afterOperation: ({ operation, item, originalItem, context }) => {
      // let saveLiveblogJSON to handle if liveblog not active
      if (
        operation === 'create' &&
        item.liveblogId &&
        item.status === 'published'
      ) {
        saveLiveblogJSON(item.liveblogId, context)
      } else if (operation === 'update') {
        if (item.liveblogId && item.status === 'published') {
          saveLiveblogJSON(item.liveblogId, context)
        } else if (
          originalItem.liveblogId &&
          originalItem.status === 'published' &&
          item.status === 'draft'
        ) {
          // published one turned into draft
          saveLiveblogJSON(originalItem.liveblogId, context)
        } else if (originalItem.liveblogId && !item.liveblogId) {
          // liveblogItem removed from liveblog
          saveLiveblogJSON(originalItem.liveblogId, context)
        }
      } else if (
        operation === 'delete' &&
        originalItem.liveblogId &&
        originalItem.status === 'published'
      ) {
        saveLiveblogJSON(originalItem.liveblogId, context)
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
