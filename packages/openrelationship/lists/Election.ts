import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { relationship, integer, select, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    name: text({ 
	  label: '名稱',
	  isRequired: true }),
    description: text({ label: '敘述' }),
    election_year_year: integer({ label: '選舉年' }),
    election_year_month: integer({ label: '選舉月' }),
    election_year_day: integer({ label: '選舉日' }),
	type: select({
	  label: '選舉類型',
	  options: [
		{ value: 'central', label: '中央選舉' },
		{ value: 'local', label: '地方選舉' },
	  ],
	  default: 'local',
	}),
    register_date: text({ label: '登記日期' }),
    location: text({ label: '位置' }),
    status: text({ label: '狀態' }),
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
