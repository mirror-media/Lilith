import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { checkbox, text } from '@keystone-6/core/fields';

const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: { isRequired: true }
    }),
    name: text({
      label: '媒體名稱',
      validation: { isRequired: true },  
      isIndexed: true,
    }),
    website: text({
      label: '網址',
      isIndexed: true, 
    }),
    public: checkbox({
      label: '公開', defaultValue: true
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
