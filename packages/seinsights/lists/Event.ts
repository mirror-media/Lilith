import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  timestamp,
  checkbox,
  json,
  virtual,
} from '@keystone-6/core/fields'

import config from '../config'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum Status {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}

enum Type {
  SEInsight = 'seinsight',
  External = 'external',
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '活動名稱',
      validation: {
        isRequired: true,
      },
    }),
    eventStatus: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const dateTime = new Date()
          const endTime = item?.event_end;
          if (endTime) {
            if (endTime >= dateTime) {
              return 'opening';
            }
            else return 'closed';
          }
          else return '';
        }
      }),
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
      validation: {
        isRequired: true,
      },
    }),
    publishDate: timestamp({
      label: '發布日期',
      defaultValue: { kind: 'now' },
    }),
    type: select({
      label: '類別',
      type: 'enum',
      options: [
        { label: '社企流', value: Type.SEInsight },
        { label: '外部活動', value: Type.External },
      ],
      // validation: {
      //   isRequired: true,
      // },
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    region: select({
      label: '地區',
      type: 'enum',
      options: config.region_options,
      // validation: {
      //   isRequired: true,
      // },
    }),
    section: relationship({
      label: '主分類',
      ref: 'Section.events',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
      many: true,
    }),
    category: relationship({
      label: '子分類',
      ref: 'Category.events',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
      many: true,
    }),
    heroImage: customFields.relationship({
      label: '活動首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
      many: false,
    }),
    content: customFields.richTextEditor({
      label: '敘述',
      disabledButtons: ['header-four', 'code', 'code-block', 'annotation', 'info-box'],
    }),
    location: text({
      label: '地點',
    }),
    organization: text({
      label: '舉辦單位',
    }),
    event_start: timestamp({
      label: '開始時間',
    }),
    event_end: timestamp({
      label: '結束時間',
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag.events',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    relatedEvents: relationship({
      label: '相關活動',
      ref: 'Event',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    // previewButton: virtual({
    //   field: graphql.field({
    //     type: graphql.String,
    //     resolve(item: Record<string, unknown>): string {
    //       return `/event/${item?.slug}`
    //     },
    //   }),
    //   ui: {
    //     views: require.resolve('./preview-button'),
    //   },
    // }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: () => true,
      // update: allowRoles(admin, moderator),
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

export default utils.addTrackingFields(listConfigurations)
