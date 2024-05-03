import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  password,
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
    title: text({ validation: { isRequired: false } }),
    official_site: text({ validation: { isRequired: true } }),
    rss: text({ validation: { isRequired: true } }),
    apidata_endpoint: text({
      label: 'APIDATA Endpoint',
      validation: {isRequired: false},
    }),
    need_apidata: checkbox({
      label: '需抓取APIDATA',
      defaultValue: false,
    }),
    summary: text({ validation: { isRequired: false } }),
    logo: text({ validation: { isRequired: false } }),
    description: text({ validation: { isRequired: false } }),
    customId: text({
      label: 'customId',
	  validation: {
        isRequired: true,
      },
	  isindexed: 'unique',
    }),
	lang: select({
	  label: '語系',
	  datatype: 'enum',
	  options: [ 
		{ label: '繁體中文', value: 'zh-TW' }, 
		{ label: '英文', value: 'en-US' },
		{ label: '日文', value: 'ja-Jp' }
      ],
	  defaultValue: 'zh-TW',
	}),
	full_content: checkbox({
	  defaultValue: false,
	}),
	full_screen_ad: select({
	  label: '蓋板',
	  datatype: 'enum',
	  options: [ 
		{ label: '手機', value: 'mobile' }, 
		{ label: '桌機', value: 'desktop' },
		{ label: '所有尺寸', value: 'all' },
		{ label: '無', value: 'none' }
      ],
	  defaultValue: 'none',
	}),
	source_type: select({
	  label: '資料來源',
	  // datatype: 'enum',
	  options: [ 
		{ label: '鏡週刊', value: 'mirrormedia' }, 
		{ label: 'READr', value: 'readr' },
		{ label: '鏡週刊 external', value: 'mm_external' },
		{ label: 'rss', value: 'rss' }
      ],
	  defaultValue: 'rss',
	}),
  paywall: checkbox({
    defaultValue: false,
  }),
	follower: relationship({
	  ref: 'Member.follow_publisher',
	  many: true,
	}),
      //posts: relationship({ ref: 'Post.author', many: true }),
    wallet: text({
      label: '區塊鏈錢包',
    }),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'summary'],
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
