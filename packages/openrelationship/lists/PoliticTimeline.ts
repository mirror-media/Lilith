import { list } from '@keystone-6/core';
import { customFields, utils } from '@mirrormedia/lilith-core'
import { select, checkbox, integer, relationship, timestamp, text } from '@keystone-6/core/fields';
import { STATUS, STATUS_LABEL, DESC_LENGTH } from './constants'

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
      label: '候選人政見',
      many: true,
      ref: 'Politic.timeline',
    }),
    eventDate: timestamp({
      label: '日期',
    }),
    sortOrder: integer({
      label: '排序',
    }),
    content: text({ 
	  label: '文字',
	  ui: {
	    displayMode: 'textarea',
	  },
	}),
    link: text({ 
	  label: '連結',
	}),
    contributer: text({ label: '資料提供' }),
    status: select({
      options: [
        { label: STATUS_LABEL[STATUS.VERIFIED], value: STATUS.VERIFIED },
        { label: STATUS_LABEL[STATUS.NOTVERIFIED], value: STATUS.NOTVERIFIED },
      ],
      defaultValue: STATUS.NOTVERIFIED,
      label: '狀態',
      isIndexed: true,
    }),
    reviewed: checkbox({
      defaultValue: false,
      label: '檢閱',
    }),
    editingPolitic: relationship({
      label: '候選人政見（待審核）',
      many: true,
      ref: 'EditingPolitic.timeline',
    }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
  },
  access: {
	operation: {
	  query: allowRoles(admin, moderator, editor),
	  update: allowRoles(admin, moderator, editor),
	  create: allowRoles(admin, moderator, editor),
	  delete: allowRoles(admin),
	},
  },
  hooks: {
    beforeOperation: async ({ operation, resolvedData, context, item }) => {
      /* ... */
      if (operation === 'create' && context.session?.data?.role === 'admin') {
        resolvedData.reviewed = true
		resolvedData.status =  STATUS.VERIFIED
      }
	},
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
          where: { id: item.createdById?.toString() },
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
        where: { id: item.createdById?.toString() },
        query: 'name',
      });
      if (context!.session?.data?.name !== name && context?.session?.data?.role === 'editor') {
        addValidationError("沒有權限")
      }
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
