import { list } from '@keystone-6/core';
import {
  text,
  relationship,
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
	name: text({ validation: { isRequired: true, isUnique: true } }),
    pick: relationship({ ref: 'Pick', many: true }),
  },
  ui: {
    listView: {
      initialColumns: ['name'],
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
