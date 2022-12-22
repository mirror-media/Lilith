import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, timestamp, integer, select } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum Status {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}

const listConfigurations = list({

  fields: {
    name: text({
      label: '標題',
      validation: {
        isRequired: true
      }
    }),
    order: integer({
      label: '排序',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
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
    url: text({
      label: '網站連結',
      validation: { isRequired: true },
    }),
  },
  hooks: {
    validateInput: async ({ resolvedData,item,  operation, inputData, addValidationError }) => {
      if (operation == 'create') {
        if (!('heroImage' in inputData)) {
          addValidationError('圖片不能空白')
        }
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
        if ('heroImage' in inputData && 
        'disconnect' in inputData['heroImage'] &&
          inputData['heroImage']['disconnect'] == true
        ) {
          addValidationError('圖片不能空白')
        }
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
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
