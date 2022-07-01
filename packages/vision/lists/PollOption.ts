import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, integer, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({
      label: '選項',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    order: integer({
      isOrderable: true,
    }),
    poll: relationship({
      ref: 'Poll.options',
      ui: {
        hideCreate: true,
        displayMode: 'select',
        cardFields: ['name'],
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: false,
    }),
    result: relationship({
      ref: 'PollResult.option',
      ui: {
        hideCreate: true,
      },
      many: true,
    }),
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
