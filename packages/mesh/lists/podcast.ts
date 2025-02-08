import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  timestamp,
  checkbox,
  json,
} from '@keystone-6/core/fields'
import { checkAccessToken } from '../utils/accessToken'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    url: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    source: relationship({ ref: 'Publisher', many: false }),
    document: relationship({ ref: 'Story', many: false }),
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
