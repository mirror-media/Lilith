import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, json, select } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    activity_id: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    activity_type: select({
      type: 'enum',
      options: [
        { label: 'Create', value: 'Create' },
        { label: 'Like', value: 'Like' },
        { label: 'Announce', value: 'Announce' },
        { label: 'Follow', value: 'Follow' },
      ],
    }),
    actor: relationship({ ref: 'ActivityPubActor', many: false }),
    object_data: json({}),
    target_data: json({}),
    to: json({}),
    cc: json({}),
  },
  ui: {
    listView: {
      initialColumns: ['activity_id', 'activity_type', 'actor'],
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


