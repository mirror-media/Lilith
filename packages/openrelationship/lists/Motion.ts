import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {timestamp, integer, text, select, checkbox, relationship} from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    organization: text({ 
	  label: '組織', 
	  isRequired: true }),
    legislative_session: text({ 
	  label: 'legislative_session'
	}),
    creator: text({ label: 'creator' }),
    text: text({ label: 'text' }),
    identifier: text({ label: 'identifier' }),
    classification: text({ label: 'classification' }),
    date: text({ label: '日期' }),
    requirement: text({ label: 'requirement' }),
    result: text({ label: '結果' }),
    vote_events: text({ label: 'vote_events' }),
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
