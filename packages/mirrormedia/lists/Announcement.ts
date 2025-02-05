import { utils } from '@mirrormedia/lilith-core'
import { graphql, list } from '@keystone-6/core'
import {
  relationship,
  text,
  timestamp,
  virtual,
  select,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({
      label: '公告標題',
      db: {
        isNullable: false,
      },
      validation: {
        isRequired: true,
      },
      ui: {
        displayMode: 'input',
      },
    }),
    description: text({
      label: '公告內容',
      db: {
        isNullable: false,
      },
      validation: {
        isRequired: true,
      },
      ui: {
        displayMode: 'textarea',
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
        async resolve(item) {
          const now = Date.now()
          const startDate = item.startDate as Date | null | undefined
          const endDate = item.endDate as Date | null | undefined

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
    level: select({
      label: '公告重要程度',
      type: 'enum',
      defaultValue: 'info',
      options: [
        {
          label: '一般',
          value: 'info',
        },
        {
          label: '重要',
          value: 'warning',
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    scope: relationship({
      label: '公告要顯示的範圍',
      ref: 'AnnouncementScope',
      many: true,
      ui: {
        labelField: 'name',
      },
    }),
  },
  hooks: {},
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['id', 'title', 'isActive', 'level'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
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
