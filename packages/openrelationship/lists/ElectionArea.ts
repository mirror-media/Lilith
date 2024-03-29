import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core';
import { virtual, relationship, integer, select, text } from '@keystone-6/core/fields';

const {
	allowRoles,
	admin,
	moderator,
	editor,
	owner,
} = utils.accessControl

const listConfigurations = list({
	fields: {
		name: text({
			label: '選舉區名稱',
			validation: { isRequired: true },
		}),
		election: relationship({ 
			ref: 'Election.electionArea',
		}),
		indigenous: select({
			label: '選區類別',
			options: [
				{ value: 'plainIndigenous', label: '平地原住民' },
				{ value: 'mountainIndigenous', label: '山地原住民' },
				{ value: 'indigenous', label: '原住民' },
				{ value: 'normal', label: '一般選區' },
			],
		}),
		description: text({ label: '敘述' }),
		status: select({
			label: '狀態',
			options: [
				{ value: 'active', label: '有效' },
				{ value: 'deactive', label: '失效' },
			],
			defaultValue: 'active',
		}),
	    city: virtual({
		  field: graphql.field({
		    type: graphql.String,
			async resolve(item) {
			  const areaname = item.name;
			  const matched = areaname.match(/(.+?(縣|市))/);
			  if (matched) {
			    return matched[0];
			  } else {
				return "";
			  }
			},
		  }),
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
