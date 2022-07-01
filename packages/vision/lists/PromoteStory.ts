import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { integer, relationship, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    post: relationship({
      ref: 'Post',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        cardFields: ['name'],
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
      many: false,
    }),
    weight: integer({ label: '權重', defaultValue: 2 }),
    active: checkbox({ label: '啟用', defaultValue: true }),
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
