import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '單位',
      validation: {
        isRequired: true,
      },
      isindexed: 'unique',
    }),
    slug: text({
      validation: { isRequired: true },
      isindexed: 'unique',
    }),
    intro: text({
      validation: { isRequired: false },
      ui: {
        displayMode: 'textarea',
      },
    }),
    is_active: checkbox({
      defaultValue: true,
    }),
    template: text({
      ui: {
        displayoOde: 'textarea',
      },
    }),
    liveblog: relationship({
      ref: 'Liveblog.publisher',
      ui: {
        displayMode: 'display',
        cardFields: ['name'],
        inlineCreate: { fields: ['name', 'publishTime', 'heroImage'] },
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    form: relationship({
      ref: 'Form.publisher',
      ui: {
        displayMode: 'display',
        cardFields: ['name'],
        inlineCreate: { fields: ['name', 'publishTime', 'heroImage'] },
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
  },
  ui: {
    listView: {
      initialColumns: ['name', 'slug', 'is_active'],
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
  hooks: {
    resolveInput: ({ resolvedData, item }) => {
      if (item?.is_active === true && resolvedData.is_active === false) {
        resolvedData.email = `inactive: ${item?.email}  ${item?.firebaseId}`
        resolvedData.firebaseId = `inactive: ${item?.firebaseId}`
      } else if (item?.is_active === false && resolvedData.is_active === true) {
        const newId = item?.firebaseId?.replace(/^inactive: /, '')
        resolvedData.firebaseId = newId
        resolvedData.email = item?.email
          ?.replace(/^inactive: /, '')
          .replace(`  ${newId}`, '')
      }

      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
