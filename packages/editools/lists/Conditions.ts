import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, select, text, integer } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    type: select({
      options: [
        { label: 'AND', value: 'AND' },
        { label: 'OR', value: 'OR' },
      ],
      defaultValue: 'AND',
    }),
    order: integer({
      label: '優先順序',
      validation: { isRequired: true },
    }),
    condition: relationship({
      ref: 'Condition.conditionCollection',
      many: true,
    }),
    answer: relationship({
      ref: 'FormAnswer.conditionCollection',
      many: false,
    }),
    next: relationship({
      ref: 'Field.conditionCollection',
      many: false,
    }),
    goOut: text({
      label: '前往其他網址',
    }),
    form: relationship({
      ref: 'Form.conditions',
      many: false,
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
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
