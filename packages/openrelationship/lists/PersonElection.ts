import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core';
import { virtual, checkbox, select, relationship, json, timestamp, text } from '@keystone-6/core/fields';
	  
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
    mainCandidate: relationship({
      label: '搭配主要候選人',
      ref: 'PersonElection',
    }),
    /*
    name: virtual({
	  field: graphql.field({
		type: graphql.String,
		async resolve(item, args, context) {
          const { person_id, election } = await context.query.PersonElection.findOne({
            where: { id: item.id.toString() },
            query: 'person_id { name }, election {name}',
          });
          console.log(election.name);
          return person_id.name + "-" + election.name;
		},
	  }),
    }),
    */
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
    source: text({ 
	  label: '資料來源', 
		ui: {
		  displayMode: 'textarea',
		}
	}),
    politicSource: text({ 
	  label: '政見資料來源', 
		ui: {
		  displayMode: 'textarea',
		}
	}),
    organization: relationship({
      label: '人物-組織',
      many: false,
      ref: 'PersonOrganization.election',
    }),
	politics: relationship({ 
	  label: '政見',
	  many: true,
	  ref: 'Politic.person',
	 }),
	status: select({
	  options: [
	    { label: '正常', value: 'regular' },
	    { label: '資料存檔', value: 'archive' },
	  ],
	  defaultValue: 'notverified',
	  label: '狀態',
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
