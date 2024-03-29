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
      many: true,
      ref: 'Politic.response',
    }),
    responseName: text({
      label: '回應者姓名',
	  validation: { isRequired: true },
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
	  validation: { isRequired: true },
	  defaultValue: '',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
    content: text({ 
	  label: '回應內容',
	  defaultValue: '',
	  validation: { isRequired: true },
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
    editingPolitic: relationship({
      label: '政見（待審核）',
      many: true,
      ref: 'EditingPolitic.response',
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
})
export default utils.addTrackingFields(listConfigurations)
