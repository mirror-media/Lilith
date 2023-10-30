import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { relationship, select, timestamp, text } from '@keystone-6/core/fields';
	  
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
	  label: '組織名稱',
	  isRequired: true 
	}),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
    logo: relationship({
	  label: '大 Logo 網址（for landing page）',
      ref: 'Photo',
    }),
    slogo: relationship({
	  label: '小 Logo 網址（for politic page）', 
      ref: 'Photo',
    }),
	year: select({
		label: '年份',
		options: [
			{ value: '2023', label: '2023' },
			{ value: '2024', label: '2024' },
			{ value: '2025', label: '2025' },
			{ value: '2026', label: '2026' },
			{ value: '2027', label: '2027' },
			{ value: '2028', label: '2028' },
			{ value: '2029', label: '2029' },
		],
		defaultValue: '2023',
	}),
	type: select({
		label: '合作形式',
		options: [
			{ value: '合作媒體', label: '合作媒體' },
			{ value: '協作單位', label: '協作單位' },
		],
		defaultValue: '合作媒體',
	}),
    webUrl: text({ 
	  label: '網站網址' 
	}),
    posts: relationship({
      label: '相關報導',
      many: true,
      ref: 'RelatedPost.partner',
    }),
    positionChange: relationship({
      label: '查核「立場改變」',
      many: true,
      ref: 'PoliticPositionChange.factcheckPartner',
    }),
    factCheck: relationship({
      label: '查核「政見事實查核」',
      many: true,
      ref: 'PoliticFactCheck.factcheckPartner',
    }),
    repeat: relationship({
      label: '查核「重覆政見」',
      many: true,
      ref: 'PoliticRepeat.factcheckPartner',
    }),
    controversies: relationship({
      label: '查核「爭議事件」',
      many: true,
      ref: 'PoliticControversie.factcheckPartner',
    }),
    // identifiers: { label: "identifiers", type: Relationship, many: false, ref: 'User',  isRequired: true},
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
