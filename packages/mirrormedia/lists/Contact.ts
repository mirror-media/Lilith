import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {relationship,text} from '@keystone-6/core/fields';
	  
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
      isIndexed: true, 
      label: '作者姓名', 
      validation: { isRequired: true} 
    }),
    email: text({
      isIndexed: 'unique',
    }),
    image: relationship({
      label: '照片',  
      ref: 'Photo',
    }),
    homepage: text({
      label: '個人首頁', 
      isIndexed: false 
    }),
    facebook: text({
       isIndexed: false,  
    }),
    twitter: text({
      isIndexed: false 
    }),
    instantgram: text({
      isIndexed: true,  
    }),
    address: text({
      collapse: 'true',  
    }),
    bio: text({
      label: '簡介',  
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
