import { customFields, utils } from '@mirrormedia/lilith-core'
import { graphql, list } from '@keystone-6/core'
import { text, virtual } from '@keystone-6/core/fields'

import { formatChangedList } from '../utils/formatChangedList'

const { allowRoles, admin, moderator, editor } = utils.accessControl

type DraftContent = {
  blocks?: { text: string }[]
}

const extractText = (val: unknown): string => {
  if (!val || typeof val !== 'object') return ''
  const content = val as DraftContent
  return content.blocks?.find((b) => b.text)?.text ?? ''
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '編輯者',
      validation: { isRequired: true },
      ui: { itemView: { fieldMode: 'read' } },
    }),

    operation: text({
      label: '動作',
      validation: { isRequired: true },
      ui: { itemView: { fieldMode: 'read' } },
    }),

    postSlug: text({
      label: '文章Slug',
      ui: { itemView: { fieldMode: 'read' } },
      isIndexed: true,
    }),

    changedList: text({
      label: '欄位更動內容',
      ui: {
        displayMode: 'textarea',
        itemView: { fieldMode: 'edit' },
      },
      hooks: {
        resolveInput: async ({ resolvedData, item }) => {
          const raw = resolvedData.changedList || item?.changedList || ''
          if (typeof raw === 'string' && raw.trim().startsWith('{')) {
            return formatChangedList(raw)
          }

          return raw
        },
      },
    }),

    brief: customFields.richTextEditor({
      label: '已更動前言',
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
      disabledButtons: [],
      website: 'mirrormedia',
    }),

    briefPreview: virtual({
      label: '前言預覽',
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>): string {
          return extractText(item.brief)
        },
      }),
      ui: {
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'hidden' },
      },
    }),

    content: customFields.richTextEditor({
      label: '已更動內文',
      ui: {
        listView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
      disabledButtons: [],
      website: 'mirrormedia',
    }),

    contentPreview: virtual({
      label: '內文預覽',
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>): string {
          return extractText(item.content)
        },
      }),
      ui: {
        listView: { fieldMode: 'read' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator),
      update: allowRoles(admin),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: [
        'id',
        'name',
        'operation',
        'postSlug',
        'briefPreview',
        'contentPreview',
        'createdAt',
      ] as any,
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
