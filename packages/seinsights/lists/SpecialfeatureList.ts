import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  integer,
  relationship,
  select,
  json,
  timestamp,
  // virtual
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum Status {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}

const listConfigurations = list({
  fields: {
    title: text({
      label: '標題',
    }),
    weight: integer({
      label: '權重',
      defaultValue: 85,
      validation: {
        min: 1,
        max: 9999,
      },
      ui: {
        itemView: {fieldMode: 'hidden',},
        createView: {fieldMode: 'hidden',}
      }
    }),
    status: select({
      label: '狀態',
      type: 'enum',
      options: [
        { label: '出版', value: Status.Published },
        { label: '草稿', value: Status.Draft },
        { label: '下架', value: Status.Archived },
      ],
      defaultValue: 'draft',
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    publishDate: timestamp({
      label: '發布日期',
      defaultValue: { kind: 'now' },
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
    }),
    content: customFields.richTextEditor({
      label: '內文',
      disabledButtons: ['header-four', 'code', 'code-block', 'annotation', 'info-box'],
    }),
    specialfeatures: relationship({
      label: '調整專題文章排序（1. 依序選擇此專題收錄的文章 2. 如在開設專題頁面後、需再次調整文章順序，須先於此欄位至少刪去一篇文章並按下儲存，接著調整更新的文章順序，便能成功儲存修改。',
      ref: 'Specialfeature.specialfeatureLists',
      many: true,
      ui: {
        labelField: 'title',
      },
    }),
    manualOrderOfSpecialFeatures: json({
      label: 'SpecialFeature 手動排序結果',
      ui: {
        itemView: {
          fieldMode: 'read',
        },
      },
    }),
    url: text({
      label: '外連網址',
    }),
    section: relationship({
      label: '主分類',
      ref: 'Section.specialfeatureLists',
      ui: {
        hideCreate: true,
      },
      many: true,
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  ui: {
    labelField: 'title',
    listView: {
      initialColumns: ['id', 'title', 'publishDate', 'status'],
      initialSort: { field: 'publishDate', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      update: () => true,
      // update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      return resolvedData
    },
    validateInput: async ({
      operation,
      item,
      resolvedData,
      addValidationError,
    }) => {
      // publishDate is must while status is not `draft`
      if (operation == 'create') {
        const { status } = resolvedData
        if (status && status != 'draft') {
          const { publishDate } = resolvedData
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        }
      }
      if (operation == 'update') {
        if (resolvedData.status && resolvedData.status != 'draft') {
          const publishDate = resolvedData.publishDate || item.publishDate
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        } else if (resolvedData.publishDate === null) {
          const status = resolvedData.status || item.status
          if (status != 'draft') {
            addValidationError('需要填入發布時間')
          }
        }
      }
    },
  },
})

export default utils.addManualOrderRelationshipFields(
  [
    {
      fieldName: 'manualOrderOfSpecialFeatures',
      targetFieldName: 'specialfeatures',
      targetListName: 'Specialfeature',
      targetListLabelField: 'title',
    },
  ],
  utils.addTrackingFields(listConfigurations)
)
