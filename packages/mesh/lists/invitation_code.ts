import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  timestamp,
  select,
  checkbox,
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
	code: text({ 
	validation: { isRequired: true, isUnique: true },
	  db: { idField: { kind: 'uuid' } },
	}),
    send: relationship({ ref: 'Member.invited', many: false }),
    receive: relationship({ ref: 'Member.invited_by', many: false }),
    expired: checkbox({}),
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

export default utils.addTrackingFields(listConfigurations)
