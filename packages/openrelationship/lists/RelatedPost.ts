import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {relationship,checkbox,select,text} from '@keystone-6/core/fields';
	  
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
      label: '文章標題', 
      validation: { isRequired: true} 
    }),
    brief: text({
      label: '前言',  
      ui: { displayMode: 'textarea' } 
    }),
    url: text({
      validation: { isRequired: true}, 
      label: '文章網址' 
    }),
    ogIMage: text({
      validation: { isRequired: true}, 
      label: '文章 og 圖片',  
    }),
    partner: relationship({
      label: '合作夥伴',
	  ref: 'FactcheckPartner.posts',
	  many: true,
    }),
    election: relationship({
      label: '相關選舉',
	  ref: 'Election',
	  many: true,
    }),
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
