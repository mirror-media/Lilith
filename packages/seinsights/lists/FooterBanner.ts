import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  timestamp,
  integer,
  checkbox,
  relationship,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: {
        isRequired: true,
      },
    }),
    order: integer({
      label: '排序',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    bannerImage: relationship({
      label: '圖片',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      many: false,
    }),
    mobileImage: relationship({
      label: '手機圖片',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      many: false,
    }),
    isActive: checkbox({
      label: '狀態（啟用）',
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
    validateInput: async ({ operation, inputData, addValidationError }) => {
      if (operation == 'create') {
        if (!('bannerImage' in inputData)) {
          addValidationError('圖片不能空白')
        }
      }
      if (operation == 'update') {
        if (
          'bannerImage' in inputData &&
          'disconnect' in inputData['bannerImage'] &&
          inputData['bannerImage']['disconnect'] == true
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
