import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import {
  text,
  relationship,
  timestamp,
  integer,
  select,
} from '@keystone-6/core/fields'

/*eslint-disable */
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl
/*eslint-disable */

const listConfigurations = list ({
    fields: {
      story: relationship({ ref: 'Story', many: false }),
      collection: relationship({ ref: 'Collection', many: false }),
      summary: text({ validation: { isRequired: false } }),
	  sort_order: integer({ defaultValue: 2, }),
      creator: relationship({  
	  	ref: 'Member',
		many: false,
	  }),
	  objective: select({
		label: '類型',
	 	datatype: 'enum',
		options: [
		  { label: '新聞', value: 'story' },
		  {	label: '專題', value: 'collection' },
		]
	  }),
      collection: relationship({ ref: 'Collection.collectionpicks', many: false }),
	  picked_date: timestamp({ validation: { isRequired: false} }),
	  updated_date: timestamp({ validation: { isRequired: false} }),
    },
    ui: {
      listView: {
        initialColumns: ['title', 'slug'],
      },
    },
})

export default utils.addTrackingFields(listConfigurations)
