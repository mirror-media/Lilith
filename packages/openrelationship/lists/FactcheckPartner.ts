import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { relationship, timestamp, text } from '@keystone-6/core/fields';
	  
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
    logo: text({ 
	  label: 'Logo 網址' 
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
