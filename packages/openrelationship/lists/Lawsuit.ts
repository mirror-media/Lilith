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
    person: relationship({
      label: '人物',
      many: false,
      ref: 'Person',
    }),
    crime_year: text({ 
	  label: '年份', 
	}),
    desc: text({ 
	  label: '敘述', 
	}),
    source: text({ label: '資料來源' }),
    contributer: text({ label: '資料提供' }),
	judge_number: text({ label: '裁判書字號' }),
	judge_desc: text({ label: '裁判案由' }),
	judge_content: text({ label: '裁判案由' }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
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
