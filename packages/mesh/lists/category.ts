import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {
  text,
  integer,
  relationship,
  password,
  timestamp,
  select,
} from '@keystone-6/core/fields';

const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    title: text({ validation: { isRequired: false } }),
    slug: text({ validation: { isUnique:true, isRequired: true } }),
    summary: text({ validation: { isRequired: false } }),
    priority: integer({
      validation: {isRequired: true, min: 0},
      defaultValue: 0,
    }),
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

export default utils.addTrackingFields(listConfigurations)
