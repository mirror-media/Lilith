import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { checkbox, relationship, json, timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    person_id: relationship({
      label: '組織名稱',
      many: false,
      ref: 'Person',
    }),
    election: relationship({
      label: '選舉',
      ref: 'Election',
    }),
	party: text({ label: '推薦政黨' }),
    // election_name: { label: "選舉名稱", type: Text },
    legislatoratlarge_number: text({ label: '不分區立委排序' }),
    number: text({ label: '號次' }),
    electoral_district: text({ label: '選區' }),
    votes_obtained_number: text({ label: '得票數' }),
    votes_obtained_percentage: text({ label: '得票率' }),
    elected: text({ label: '是否當選' }),
    incumbent: text({ label: '是否現任' }),
    source: text({ label: '資料來源' }),

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
