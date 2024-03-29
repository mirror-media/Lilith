import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
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
    politic: relationship({
      label: '政見',
      many: true,
      ref: 'Politic.expertPoint',
    }),
    expert: text({ 
	  label: '專家姓名',
	  validation: { isRequired: true },
	}),
    avatar: text({ 
	  label: '頭像連結',
	}),
    title: text({ 
	  label: '職稱',
	  validation: { isRequired: true },
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    expertPointSummary: text({
      label: '專家觀點（摘要）',
	  validation: { 
        isRequired: true,
		length: {
		  max: 15,
		},
      },
	  defaultValue: '',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
    content: text({ 
	  label: '意見內容',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    link: text({ 
	  label: '連結',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    contributer: text({ 
	  label: '資料提供',
	  ui: {
	    displayMode: 'textarea'
	  }
	}),
    editingPolitic: relationship({
      label: '政見（待審核）',
      many: true,
      ref: 'EditingPolitic.expertPoint',
    }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
  },
  hooks: {
    validateInput: async ({
      listKey,
      operation,
      inputData,
      item,
      resolvedData,
      context,
      addValidationError,
    }) => { /* ... */ 
      if (operation === 'update') {
        const { name } = await context.query.User.findOne({
          where: { id: item.createdById.toString() },
          query: 'name',
        });
        if (context!.session?.data?.name !== name && context?.session?.data?.role === 'editor') {
          addValidationError("沒有權限")
        }
      }
    },
    validateDelete: async ({
      listKey,
      fieldKey,
      operation,
      item,
      context,
      addValidationError,
    }) => { /* ... */ 
      const { name } = await context.query.User.findOne({
        where: { id: item.createdById.toString() },
        query: 'name',
      });
      if (context!.session?.data?.name !== name && context?.session?.data?.role === 'editor') {
        addValidationError("沒有權限")
      }
    },
  },
  access: {
	operation: {
	  query: allowRoles(admin, moderator, editor),
	  update: allowRoles(admin, moderator, editor),
	  create: allowRoles(admin, moderator, editor),
	  delete: allowRoles(admin, moderator, editor),
	},
  },
})
export default utils.addTrackingFields(listConfigurations)
