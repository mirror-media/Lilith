import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { integer, text, relationship, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({
      label: '名稱（長度限制：17）',
      validation: {
        isRequired: true,
      },
    }),
    slug: text({
      label: 'Slug（必填）',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    weight: integer({
      label: '權重',
      defaultValue: 3,
    }),
    active: checkbox({ label: '啟用', defaultValue: true }),
    group: relationship({
      ref: 'Group.category',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: false,
    }),
    classify: relationship({
      ref: 'Classify.category',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: true,
    }),
    sdg: relationship({
      ref: 'SDG.category',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: true,
    }),
    posts: relationship({
      ref: 'Post.category',
      ui: {
        displayMode: 'select',
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
