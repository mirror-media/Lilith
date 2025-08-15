import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, select, checkbox, timestamp } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    instance: relationship({ ref: 'FederationInstance.connection', many: false }),
    connection_type: select({
      type: 'enum',
      options: [
        { label: 'http', value: 'http' },
        { label: 'https', value: 'https' },
      ],
    }),
    direction: select({
      type: 'enum',
      options: [
        { label: 'inbound', value: 'inbound' },
        { label: 'outbound', value: 'outbound' },
      ],
    }),
    source_actor: text({}),
    target_actor: text({}),
    activity_id: text({}),
    status: select({
      type: 'enum',
      options: [
        { label: 'pending', value: 'pending' },
        { label: 'success', value: 'success' },
        { label: 'failed', value: 'failed' },
      ],
    }),
    error_message: text({}),
    processed_at: timestamp({}),
  },
  ui: {
    listView: { initialColumns: ['instance', 'direction', 'status'] },
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


