import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({ label: '名稱', validation: { isRequired: true } }),
    url: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
    category: relationship({
      ref: 'Category.sdg',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        cardFields: ['name'],
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    posts: relationship({
      ref: 'Post.sdg',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        cardFields: ['name'],
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    heroImage: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
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
