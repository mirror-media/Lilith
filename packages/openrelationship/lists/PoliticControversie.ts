import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { checkbox, relationship, timestamp, text } from '@keystone-6/core/fields';
	  
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
      ref: 'Politic.controversies',
    }),
    content: text({ 
	  label: '爭議內容',
	  validation: { isRequired: true },
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    factcheckPartner: relationship({
      label: '查核單位',
      many: false,
      ref: 'FactcheckPartner.controversies',
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
      ref: 'EditingPolitic.controversies',
    }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
  },
  access: {
	operation: {
	  query: allowRoles(admin, moderator, editor),
	  update: allowRoles(admin, moderator, owner),
	  create: allowRoles(admin, moderator, editor),
	  delete: allowRoles(admin, moderator, editor),
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
