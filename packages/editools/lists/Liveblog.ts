import config from '../config'
import embedCodeGen from '@readr-media/react-embed-code-generator'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, relationship, checkbox, virtual } from '@keystone-6/core/fields'
import { saveLiveblogJSON, deleteLiveblogJSON } from './utils'
import { buildLiveBlogQuery } from './queries/liveblogQuery'

const embedCodeWebpackAssets = embedCodeGen.loadWebpackAssets()
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({
      label: '名稱',
      validation: {
        isRequired: true,
      },
    }),
    slug: text({
      label: 'Slug（必填）',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    desc: text({
      label: '描述',
      ui: {
        displayMode: 'textarea',
      },
    }),
    heroImage: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      customConfig: {
        isImage: true,
      },
    }),
    heroVideo: customFields.relationship({
      label: '首屏影片',
      ref: 'Video',
    }),
    active: checkbox({ label: '啟用', defaultValue: true }),
    archive: checkbox({ label: '封存', defaultValue: false }),
    credit: text({
      label: 'credit',
      ui: {
        displayMode: 'textarea',
      },
    }),
    css: text({
      label: '客製css',
      ui: {
        displayMode: 'textarea',
      },
    }),
    liveblog_items: relationship({
      ref: 'LiveblogItem.liveblog',
      ui: {
        displayMode: 'display',
        //cardFields: ['name'],
        //inlineCreate: { fields: ['name', 'publishTime', 'heroImage'] },
        //inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    tags: relationship({
      ref: 'Tag.liveblog',
      ui: {
        displayMode: 'display',
        cardFields: ['name'],
        inlineCreate: { fields: ['name'] },
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    publisher: relationship({
      ref: 'Publisher.liveblog',
      ui: {
        displayMode: 'display',
        cardFields: ['name'],
        inlineCreate: { fields: ['name', 'publishTime', 'heroImage'] },
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (
          item: Record<string, unknown>,
          args,
          context
        ): Promise<string> => {
          const take = 5
          const liveblog = await context.query.Liveblog.findOne({
            where: { id: `${item.id}` },
            query: buildLiveBlogQuery(take),
          })
          return embedCodeGen.buildEmbeddedCode(
            'react-live-blog',
            {
              initialLiveblog: liveblog,
              fetchLiveblogUrl: `https://${config.googleCloudStorage.bucket}/files/liveblogs/${item?.slug}.json`,
              fetchImageBaseUrl: `https://${config.googleCloudStorage.bucket}`,
              toLoadPeriodically: !item.archive,
            },
            embedCodeWebpackAssets
          )
        },
      }),
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
    afterOperation: ({ operation, item, originalItem, context }) => {
      if (operation === 'create' && item.active) {
        saveLiveblogJSON(item.id, context)
      } else if (operation === 'update') {
        if (item.active) {
          saveLiveblogJSON(item.id, context)
        } else if (originalItem.active) {
          // active turned off
          deleteLiveblogJSON(originalItem.slug)
        }
      } else if (operation === 'delete' && originalItem.active) {
        deleteLiveblogJSON(originalItem.slug)
      }
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
