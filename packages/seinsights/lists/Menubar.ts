import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, timestamp, integer, select, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum Status {
  Published = 'published',
  Draft = 'draft',
  Scheduled = 'scheduled',
  Archived = 'archived',
}

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
  hooks: {},
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
