import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    username: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    domain: text({ validation: { isRequired: true } }),
    display_name: text({ validation: { isRequired: false } }),
    summary: text({ validation: { isRequired: false } }),
    icon_url: text({ validation: { isRequired: false } }),
    inbox_url: text({ validation: { isRequired: false } }),
    outbox_url: text({ validation: { isRequired: false } }),
    followers_url: text({ validation: { isRequired: false } }),
    following_url: text({ validation: { isRequired: false } }),
    public_key_pem: text({ validation: { isRequired: false } }),
    private_key_pem: text({ validation: { isRequired: false } }),
    is_local: checkbox({ defaultValue: true }),
    mesh_member: relationship({ ref: 'Member', many: false }),
  },
  ui: {
    listView: {
      initialColumns: ['username', 'domain', 'display_name', 'is_local'],
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


