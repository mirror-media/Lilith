import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, integer } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor),
          update: allowRoles(admin, moderator),
          create: allowRoles(admin, moderator),
          delete: allowRoles(admin),
        },
      },
    }),
    heroImageLink: text({
      label: '首圖網址',
    }),
    content: text({
      label: '內文',
    }),
    value: text({
      label: '值',
    }),
    sortOrder: integer({
      label: '排序',
      dfaultValue: false,
    }),
    field: relationship({
      ref: 'Field.options',
      ui: {
        displayMode: 'display',
        linkToItem: true,
        inlineConnect: true,
      },
      many: false,
    }),
    condition: relationship({
      ref: 'Condition.option',
      ui: {
        displayMode: 'display',
        inlineConnect: true,
      },
      many: true,
    }),
  },
  ui: {
    listView: {
      initialSort: { field: 'name', direction: 'ASC' },
      pageSize: 50,
    },
    labelField: 'name',
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
