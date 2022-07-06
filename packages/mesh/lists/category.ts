import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  password,
  timestamp,
  select,
} from '@keystone-6/core/fields';
import { addTrackingFields } from '../../utils/trackingHandler'
import {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} from '../../utils/accessControl'

const listConfigurations = list ({
  fields: {
    title: text({ validation: { isRequired: false } }),
    slug: text({ validation: { isUnique:true, isRequired: true } }),
    summary: text({ validation: { isRequired: false } }),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'slug'],
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

export default addTrackingFields(listConfigurations)
