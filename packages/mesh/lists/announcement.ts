import { graphql, list } from '@keystone-6/core'
import { text, select, timestamp, virtual } from '@keystone-6/core/fields'
import { utils } from '@mirrormedia/lilith-core'
import type { BaseItem } from '@keystone-6/core/types'
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    type: select({
      options: [
        { label: '新增功能', value: 'features' },
        { label: '新增媒體', value: 'new-media' },
        { label: '維護公告', value: 'maintain' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'features',
    }),
    name: text({
      label: '內容',
      ui: {
        displayMode: 'textarea',
      },
      validation: { isRequired: true },
    }),
    status: select({
      options: [
        { label: '出版', value: 'published' },
        { label: '草稿', value: 'draft' },
        { label: '下架', value: 'archived' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'draft',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    startDate: timestamp({
      label: '公告起始日期',
      db: {
        isNullable: true,
      },
      validation: {
        isRequired: false,
      },
    }),
    endDate: timestamp({
      label: '公告結束日期',
      db: {
        isNullable: true,
      },
      validation: {
        isRequired: false,
      },
    }),
    isActive: virtual({
      label: '公告是否生效中',
      field: graphql.field({
        type: graphql.Boolean,
        async resolve(item: BaseItem) {
          const now = Date.now()
          const status = item.status as string
          const startDate = item.startDate as Date | null | undefined
          const endDate = item.endDate as Date | null | undefined

          if (status !== 'published') return false

          if (startDate && endDate) {
            return startDate.valueOf() < now && now < endDate.valueOf()
          } else if (startDate) {
            return startDate.valueOf() < now
          } else if (endDate) {
            return now < endDate.valueOf()
          } else {
            return true
          }
        },
      }),
    }),
  },
  ui: {
    listView: {
      initialColumns: ['type', 'status', 'isActive', 'name'],
      initialSort: { field: 'id', direction: 'DESC' },
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
