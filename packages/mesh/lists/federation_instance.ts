import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, checkbox, integer, timestamp, select, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    domain: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    name: text({}),
    description: text({}),
    software: text({}),
    version: text({}),
    is_active: checkbox({ defaultValue: true }),
    is_approved: checkbox({ defaultValue: false }),
    is_blocked: checkbox({ defaultValue: false }),
    last_seen: timestamp({}),
    last_successful_connection: timestamp({}),
    user_count: integer({ defaultValue: 0 }),
    post_count: integer({ defaultValue: 0 }),
    connection_count: integer({ defaultValue: 0 }),
    error_count: integer({ defaultValue: 0 }),
    auto_follow: checkbox({ defaultValue: false }),
    auto_announce: checkbox({ defaultValue: true }),
    max_followers: integer({ defaultValue: 1000 }),
    max_following: integer({ defaultValue: 1000 }),
    connection: relationship({ ref: 'FederationConnection.instance', many: true }),
  },
  ui: {
    listView: { initialColumns: ['domain', 'software', 'version', 'is_active', 'is_approved'] },
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


