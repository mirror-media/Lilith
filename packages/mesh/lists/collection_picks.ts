import { list } from '@keystone-6/core';

import {
  text,
  relationship,
  password,
  timestamp,
  select,
} from '@keystone-6/core/fields';

export const collection_picks = list ({
    fields: {
      story: relationship({ ref: 'Pick', many: false }),
      collection: relationship({ ref: 'Collection', many: false }),
      summary: text({ validation: { isRequired: false } }),
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
	  picked_date: timestamp({ validation: { isRequired: false} }),
	  updated_date: timestamp({ validation: { isRequired: false} }),
    },
    ui: {
      listView: {
        initialColumns: ['title', 'slug'],
      },
    },
})
