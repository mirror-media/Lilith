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
    post: relationship({
      ref: 'Post',
      ui: {
        hideCreate: true,
        labelField: 'name',
      },
      many: false,
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
      defaultVaule: { kind: 'now' },
    }),
  },
  ui: {
    listView: {
  
      initialColumns: ['order', 'post', 'status', 'publishDate',  ],
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
        // post和specialfeature擇一
        const { post, specialfeature } = resolvedData
        if (post && specialfeature){
          addValidationError('post和specialfeature擇一填入')
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
        // post和specialfeature擇一
        if ('post' in inputData && 'connect' in inputData['post'] && inputData['post']['connect'] ){
          if (('specialfeature' in inputData && 'disconnect' in inputData['specialfeature'] && inputData['specialfeature']['disconnect'] == true)){
          }
          else if (item.specialfeatureId){
            addValidationError('post和specialfeature擇一填入')
          }
        }
        else if ('specialfeature' in inputData && 'connect' in inputData['specialfeature'] && inputData['specialfeature']['connect']){
            if (('post' in inputData && 'disconnect' in inputData['post'] && inputData['post']['disconnect'] == true)){
              // addValidationError('post和specialfeature擇一填入')
            }
            else if (item.postId){
              addValidationError('post和specialfeature擇一填入')
            }
          }  
      }
    },
  }
})

export default utils.addTrackingFields(listConfigurations)
