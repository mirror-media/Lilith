import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, select, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({
      label: '名稱',
    }),
    formField: relationship({
      ref: 'Field.condition',
      many: false,
    }),
    compare: select({
      label: 'compare',
      type: 'string',
      options: [
        {
          label: '是',
          value: 'is',
        },
        {
          label: '不是',
          value: 'not',
        },
        {
          label: '包含',
          value: 'include',
        },
        /*
        {
          label: '排除',
          value: 'exclude',
        },
*/
      ],
      validation: { isRequired: true },
    }),
    option: relationship({
      ref: 'FieldOption.condition',
      many: true,
    }),
    conditionCollection: relationship({
      ref: 'ConditionCollection.condition',
      many: true,
    }),
  },
  ui: {
    labelField: 'title',
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
