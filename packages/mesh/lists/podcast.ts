import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  integer,
} from '@keystone-6/core/fields'
import { checkAccessToken } from '../utils/accessToken'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    author: text({ 
      label: '作者', 
      validation: { isRequired: false },
    }),
    url: text({
      label : '音源連結',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    file_size: integer({ 
      label : '音源檔案大小',
      validation: { isRequired: false },
    }),
    mime_type: text({ 
      label : '音源檔案格式',
      validation: { isRequired: false } 
    }),
    duration: text({ validation: { isRequired: false } }),
    source: relationship({ ref: 'Publisher', many: false }),
    story: relationship({ 
      label : '所屬文章',
      ref: 'Story', many: false 
    }),
  },
  ui: {
    listView: {
      initialColumns: ['story','source', "url"],
    },
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
