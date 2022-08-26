import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, timestamp, integer, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl


const listConfigurations = list({

  fields: {
    name: text({
      label: '名稱',
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
    mobileImage: customFields.relationship({
      label: '手機用圖片',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
      many: false,
    }),
    desktopImage: customFields.relationship({
      label: '桌機用圖片',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
      validation: { isRequired: true },
      many: false,
    }),
    isActive: checkbox({
      label: '狀態（啟用）',
    }),
    publishDate: timestamp({
      label: '發布日期',
      defaultVaule: { kind: 'now' },
    }),
    url: text({
      label: '網站連結',
      validation: { isRequired: true },
    }),
  },
  hooks: {
    validateInput: async ({ operation, inputData, addValidationError }) => {
      if (operation == 'create') {
        if (!('desktopImage' in inputData)) {
          addValidationError('圖片不能空白')
        }
      }
      if (operation == 'update') {
        if ('desktopImage' in inputData && 
        'disconnect' in inputData['desktopImage'] &&
          inputData['desktopImage']['disconnect'] == true
        ) {
          addValidationError('圖片不能空白')
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
