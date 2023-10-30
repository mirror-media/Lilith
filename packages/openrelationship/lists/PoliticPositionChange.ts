import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { checkbox, select, relationship, timestamp, text } from '@keystone-6/core/fields';
	  
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
      ref: 'Politic.positionChange',
    }),
    factcheckPartner: relationship({
      label: '查核單位',
      many: false,
      ref: 'FactcheckPartner.positionChange',
    }),
    checkDate: timestamp({
      label: '日期',
	  validation: { isRequired: true },
    }),
    positionChangeSummary: text({
      label: '立場變化（摘要）',
	  validation: { isRequired: true },
	  defaultValue: '',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
    content: text({ 
	  label: '查核內容',
	  validation: { isRequired: true },
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    isChanged: select({
      defaultValue: 'same', 
      options: [ 
        { label: '曾持相同意見', value: 'same' }, 
        { label: '曾持不同意見', value: 'changed' }, 
        { label: '當時未表態', value: 'noComment' },
      ], 
      label: '立場改變',
	  validation: { isRequired: true },
	  isIndexed: true,
    }),
    link: text({ 
	  label: '相關連結',
	  validation: { isRequired: true },
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    editingPolitic: relationship({
      label: '政見',
      many: true,
      ref: 'EditingPolitic.positionChange',
    }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
  },
  access: {
	operation: {
	  query: allowRoles(admin, moderator, editor),
	  update: allowRoles(admin, moderator, editor),
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
