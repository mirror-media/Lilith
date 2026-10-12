import envVar from '../environment-variables'
import { utils, customFields } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  timestamp,
  virtual,
  json,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'Slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),

    partner: relationship({
      label: '合作單位',
      ref: 'Partner',
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

    subtitle: text({
      label: '副標',
    }),

    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Archived', value: 'archived' },
        { label: 'Invisible', value: 'invisible' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),

    publishTime: timestamp({
      label: '發佈時間',
      isIndexed: true,
      isFilterable: true,
    }),

    byline: text({
      label: '作者',
    }),

    thumbnail: text({
      label: '縮圖',
    }),

    heroCaption: text({
      label: '首圖圖說',
    }),

    brief_original: text({
      label: '前言(RSS source)',
      ui: { displayMode: 'textarea' },
    }),

    content_original: text({
      label: '內文(RSS source)',
      ui: { displayMode: 'textarea' },
    }),

    brief: customFields.richTextEditor({
      label: '前言',
      ui: {
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
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
      website: 'mirrortv',
    }),
    content: customFields.richTextEditor({
      label: '內文',
      ui: {
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
        createView: { fieldMode: 'hidden' },
      },
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
      website: 'mirrortv',
    }),

    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
    }),

    categories: relationship({
      label: '分類',
      ref: 'Category',
      many: true,
      ui: {
        labelField: 'name',
        displayMode: 'select',
        views: './lists/views/post/categories/index',
      },
    }),
    manualOrderOfCategories: json({
      isFilterable: false,
      label: '分類手動排序結果',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),

    source: text({
      label: '原文網址',
    }),
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },

  ui: {
    labelField: 'label',

    listView: {
      initialColumns: [
        'name',
        'slug',
        'state',
        'publishTime',
        'partner',
        'createdBy',
      ],
      initialSort: { field: 'publishTime', direction: 'DESC' },
      pageSize: 50,
    },
    searchFields: ['name', 'slug'],
  },

  graphql: {
    plural: 'Externals',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

const extendedListConfigurations = utils.addTrackingFields(listConfigurations)

if (envVar.invalidateCDNCacheServerURL) {
  const originalAfterOperation =
    extendedListConfigurations.hooks?.afterOperation

  extendedListConfigurations.hooks = {
    ...extendedListConfigurations.hooks,
    afterOperation: async (params) => {
      if (typeof originalAfterOperation === 'function') {
        await originalAfterOperation(params)
      }

      const { item, originalItem } = params
      if (item?.state !== originalItem?.state) {
        const slug = item?.slug || originalItem?.slug
        if (slug) {
          try {
            const res = await fetch(
              `${envVar.invalidateCDNCacheServerURL}/external`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug }),
              }
            )

            if (!res.ok) {
              const errorText = await res.text()
              console.error(
                `[External CDN Cache] Failed to refresh external ${slug}. Status: ${res.status}, Error: ${errorText}`
              )
            } else {
              console.log(`[External CDN Cache] Refreshing external: ${slug}`)
            }
          } catch (error) {
            console.error(
              `[External CDN Cache] Failed to refresh external ${slug}:`,
              error
            )
          }
        }
      }
    },
  }
}

if (envVar.externalAutotagging && typeof envVar.dataServiceApi === 'string') {
  const previousAfterOperation =
    extendedListConfigurations.hooks?.afterOperation

  extendedListConfigurations.hooks = {
    ...extendedListConfigurations.hooks,
    afterOperation: async (params) => {
      if (typeof previousAfterOperation === 'function') {
        await previousAfterOperation(params)
      }

      const { operation, item } = params
      // externals are retagged never: feed updates every few minutes, so only
      // the initial import triggers tagging (data-services also skips any
      // external that already carries a non-partner tag)
      if (operation === 'create' && item?.state === 'published') {
        console.log(`[AutoTag] trigger external ${item.id} (create)`)
        // fire-and-forget: tagging takes ~30s and must not block the import
        fetch(
          `${envVar.dataServiceApi}/jobs/auto-tagging/externals/${item.id}`,
          { method: 'POST' }
        )
          .then((res) => {
            if (!res.ok) {
              console.error(
                `[AutoTag] failed for external ${item.id}: ${res.status}`
              )
            }
          })
          .catch((err) => {
            console.error(`[AutoTag] error for external ${item.id}:`, err)
          })
      }
    },
  }
}

export default utils.addManualOrderRelationshipFields(
  [
    {
      fieldName: 'manualOrderOfCategories',
      targetFieldName: 'categories',
      targetListName: 'Category',
      targetListLabelField: 'name',
    },
  ],
  extendedListConfigurations
)
