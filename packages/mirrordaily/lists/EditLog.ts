import { customFields, utils } from '@mirrormedia/lilith-core'
import { graphql, list } from '@keystone-6/core'
import { relationship, text, timestamp, virtual } from '@keystone-6/core/fields'

import { formatChangedList } from '../utils/formatChangedList'

const { allowRoles, admin, moderator } = utils.accessControl

type DraftContent = {
  blocks?: { text: string }[]
}

const extractText = (val: unknown): string => {
  if (!val || typeof val !== 'object') return ''
  const content = val as DraftContent
  return (
    content.blocks
      ?.map((b) => b.text)
      .filter(Boolean)
      .join(' ')
      .substring(0, 200) ?? ''
  )
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

    postId: text({
      label: '文章ID',
      ui: { itemView: { fieldMode: 'read' } },
      isIndexed: true,
    }),

    changedList: text({
      label: '欄位更動內容',
      ui: {
        displayMode: 'textarea',
        itemView: { fieldMode: 'read' },
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
      website: 'mirrordaily',
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
      website: 'mirrordaily',
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
      create: () => false,
      update: () => false,
      delete: () => false,
    },
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: [
        'id',
        'name',
        'operation',
        'postId',
        'briefPreview',
        'contentPreview',
        'createdAt',
      ] as any,
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
})

const editLogList = utils.addTrackingFields(listConfigurations)

// 更新者/更新時間永遠為空（紀錄不可被更新），建立者與「編輯者」重複。
// 用與 addTrackingFields 相同的欄位定義重新宣告，只多加 listView 隱藏 ——
// 欄位型別不變（schema 不變、免 migration），只從列表隱藏。不改共用工具。
const hiddenInListView = { fieldMode: 'hidden' } as const
const trackingItemView = { fieldMode: 'read' } as const
const trackingCreateView = { fieldMode: 'hidden' } as const

editLogList.fields.updatedAt = timestamp({
  label: '更新時間',
  ui: {
    createView: trackingCreateView,
    itemView: hiddenInListView,
    listView: hiddenInListView,
  },
})
editLogList.fields.createdBy = relationship({
  label: '建立者',
  ref: 'User',
  ui: {
    createView: trackingCreateView,
    itemView: trackingItemView,
    listView: hiddenInListView,
  },
})
editLogList.fields.updatedBy = relationship({
  label: '更新者',
  ref: 'User',
  ui: {
    createView: trackingCreateView,
    itemView: hiddenInListView,
    listView: hiddenInListView,
  },
})

export default editLogList
