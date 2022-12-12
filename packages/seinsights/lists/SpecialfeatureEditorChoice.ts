import { list } from '@keystone-6/core'
import { integer, relationship, select, timestamp } from '@keystone-6/core/fields'
import { utils } from '@mirrormedia/lilith-core'

enum Status {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}

const listConfigurations = list({
  fields: {
    order: integer({ 
      label: '排序', 
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    specialfeature: relationship({
      ref: 'Specialfeature',
      ui: {
        hideCreate: true,
        displayMode: 'select',
        labelField: 'title',
      },
      many: false,
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
  },
  ui: {
    listView: {
  
      initialColumns: ['order', 'specialfeature', 'status', 'publishDate',  ],
    }
  },
  hooks: {
    validateInput: async ({ operation, item, resolvedData, inputData, addValidationError }) => {
      
      // const { post, specialfeature } = resolvedData || item
      // console.log(post, specialfeature)
      
      if (operation == 'create') {
        // publishDate is must while status is not `draft`
        const { status } = resolvedData
        if (status && status != 'draft') {
          const { publishDate } = resolvedData
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        } 
      }
      if (operation == 'update') {
        // publishDate is must while status is not `draft`
        if (resolvedData.status && resolvedData.status != 'draft') {
          let publishDate = resolvedData.publishDate || item.publishDate
          if (!publishDate) {
            addValidationError('需要填入發布時間')
          }
        }
        else if (resolvedData.publishDate === null) {
          let status = resolvedData.status || item.status
          if (status != 'draft') {
            addValidationError('需要填入發布時間')
          }
        } 
      }
    },
  }
})

export default utils.addTrackingFields(listConfigurations)
