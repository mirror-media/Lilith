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
      label: '人物',
      many: false,
      ref: 'Person',
    }),
    election: relationship({
      label: '選舉',
      ref: 'Election',
    }),
	party: relationship({ 
	  label: '推薦政黨',
	  many: false,
	  ref: 'Organization',
	 }),
    // election_name: { label: "選舉名稱", type: Text },
    legislatoratlarge_number: text({ label: '不分區立委排序' }),
    number: text({ label: '號次' }),
    electoral_district: relationship({ 
      ref: 'ElectionArea',
      label: '選區',
     }),
    votes_obtained_number: text({ label: '得票數' }),
    votes_obtained_percentage: text({ label: '得票率' }),
    elected: checkbox({ 
      label: '是否當選'
   }),
    incumbent: checkbox({ label: '是否現任' }),
    source: text({ label: '資料來源' }),
	politics: relationship({ 
	  label: '政見',
	  many: true,
	  ref: 'Politic',
	  ui: {
		displayMode: 'cards',
		cardFields: [ 'desc', 'source', 'contributer', 'status', 'thread_parent', 'tag', 'reviewed' ],
		inlineCreate: {
		  fields: [ 'desc', 'source', 'contributer', 'status', 'thread_parent', 'tag', 'reviewed' ],
	    },
		inlineEdit: {
		  fields: [ 'desc', 'source', 'contributer', 'status', 'thread_parent', 'tag', 'reviewed' ],
	    },
	    linkToItem: true,
	  },
	 }),

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
