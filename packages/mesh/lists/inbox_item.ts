import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, json, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    activity_id: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    actor_id: text({ validation: { isRequired: true } }),
    activity_data: json({}),
    is_processed: checkbox({ defaultValue: false }),
  },
  ui: {
    listView: { initialColumns: ['activity_id', 'actor_id', 'is_processed'] },
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


