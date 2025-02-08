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
    url: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    author: text({ validation: { isRequired: false },}),
    duration: text({ validation: { isRequired: false } }),
    source: relationship({ ref: 'Publisher', many: false }),
    story: relationship({ ref: 'Story', many: false }),
    file_size: integer({ validation: { isRequired: false } }),
    mime_type: text({ validation: { isRequired: false } }),
  },
  ui: {
    listView: {
      initialColumns: ['url', "source"],
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
