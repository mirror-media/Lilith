import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {checkbox,text} from '@keystone-6/core/fields';
	  
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
       validation: { isRequired: true}, label: '名稱', isIndexed: true 
    }),
    display: text({
       isIndexed: true, validation: { isRequired: true}, label: '中文名稱' 
    }),
    website: text({
       isIndexed: true, label: '網址',  
    }),
    public: checkbox({
       label: '公開', isIndexed: true 
    }),

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
