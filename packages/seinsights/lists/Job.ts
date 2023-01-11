import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  json,
  timestamp
  // virtual,
} from '@keystone-6/core/fields'

import config from '../config'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum Status {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}

enum JobStatus {
  Opening = 'opening',
  Closed = 'closed',
}

enum JobType {
  FullTime = 'fulltime',
  PartTime = 'parttime',
  Intern = 'intern',
  Volunteer = 'volunteer',
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: { isRequired: true },
    }),
    jobStatus: select({
      label: '徵才狀態',
      type: 'enum',
      options: [
        { label: '徵才中', value: JobStatus.Opening },
        { label: '過往徵才', value: JobStatus.Closed },
      ],
      // validation: {
      //   isRequired: true,
      // },
      ui: {
        displayMode: 'segmented-control',
      },
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
        { label: '全職', value: JobType.FullTime },
        { label: '兼職', value: JobType.PartTime },
        { label: '實習', value: JobType.Intern },
        { label: '志工', value: JobType.Volunteer },
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
      ref: 'Section.jobs',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
      many: true,
    }),
    category: relationship({
      label: '子分類',
      ref: 'Category.jobs',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
      many: true,
    }),
    company: text({
      label: '公司',
    }),
    location: text({
      label: '地點',
    }),
    official_website: text({
      label: '官網網址',
    }),
    official_website_titile: text({
      label: '官網名稱',
    }),
    profile_photo: customFields.relationship({
      label: '企業頭貼',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    content: customFields.richTextEditor({
      label: '敘述',
      disabledButtons: ['header-four', 'code', 'code-block', 'annotation', 'info-box'],
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag.jobs',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    relatedJobs: relationship({
      label: '相關徵才',
      ref: 'Job',
      many: true,
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
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
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'status'],
    },
  },

  access: {
    operation: {
      query: () => true,
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

export default utils.addTrackingFields(listConfigurations)
