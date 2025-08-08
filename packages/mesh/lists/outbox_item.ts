import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, json, checkbox, integer, timestamp } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    activity_id: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    actor: relationship({ ref: 'ActivityPubActor', many: false }),
    activity_data: json({}),
    is_delivered: checkbox({ defaultValue: false }),
    delivery_attempts: integer({ defaultValue: 0 }),
    delivered_at: timestamp({}),
  },
  ui: {
    listView: { initialColumns: ['activity_id', 'actor', 'is_delivered'] },
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


