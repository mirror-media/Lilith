import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  integer,
  select,
  relationship,
  timestamp,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor, contributor, owner } =
  utils.accessControl

const listConfigurations = list({
  fields: {
    sortOrder: integer({
      label: '排序順位',
      isIndexed: true,
      validation: {
        isRequired: true,
      },
    }),

    adPost: relationship({
      label: '廣編文章',
      ref: 'Post',
    }),

    state: select({
      label: '狀態',
      type: 'enum',
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
        { label: 'scheduled', value: 'scheduled' },
        { label: 'archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      access: {
        create: allowRoles(admin, moderator, editor),
        update: allowRoles(admin, moderator, editor),
      },
    }),

    startTime: timestamp({
      label: '起始日期',
    }),

    endTime: timestamp({
      label: '結束日期',
    }),
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor, owner),
      update: allowRoles(admin, moderator, editor, contributor),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },

  ui: {
    listView: {
      initialColumns: ['adPost', 'state', 'createdAt'],
      initialSort: { field: 'id', direction: 'DESC' },
    },
  },

  hooks: {
    validateInput: async ({ resolvedData, addValidationError }) => {
      if (resolvedData.startTime && resolvedData.endTime) {
        if (resolvedData.startTime > resolvedData.endTime) {
          addValidationError('起始日期不能晚於結束日期')
        }
      }
    },
  },

  graphql: {
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
