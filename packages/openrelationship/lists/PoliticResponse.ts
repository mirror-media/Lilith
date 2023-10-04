import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { select, relationship, timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    politic: relationship({
      label: '政見',
      many: false,
      ref: 'Politic.response',
    }),
    checkDate: timestamp({
      label: '日期',
    }),
    responseName: text({
      label: '回應者姓名',
	  isRequired: true,
	  defaultValue: '',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
    responsePic: text({
      label: '回應者頭像',
    }),
    responseTitle: text({
      label: '回應者身分',
	  isRequired: true,
	  defaultValue: '',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
    content: text({ 
	  label: '回應內容',
	  isRequired: true,
	  defaultValue: '',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    link: text({ 
	  label: '相關連結',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    contributer: text({ 
	  label: '資料提供',
	  ui: {
		displayMode: 'textarea',
	  },
	}),
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
