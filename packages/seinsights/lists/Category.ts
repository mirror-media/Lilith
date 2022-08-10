import { utils, customFields } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { integer, text, relationship, select } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum CategoryStatus{
  Active = 'active',
  Inactive = 'inactive',
}
const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: {
        isRequired: true,
      },
    }),
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: {
        length: {
          min: 1,
        },
        match: {
          regex: new RegExp('^[a-zA-Z0-9]*$'),
          explanation: '限輸入英文或數字',
        }
      }
    }),
    order: integer({
      label: '排序',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    status: select({
        type:'enum',
        options: [
          {label: 'active', value: CategoryStatus.Active},
          {label: 'inactive', value: CategoryStatus.Inactive},
        ],
        validation: {
            isRequired: true,
          },
        ui: {
          displayMode: 'segmented-control',
        },
    }),
     heroImage: customFields.relationship({
      label: 'Banner圖片',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    section: relationship({
      ref: 'Section.category',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: false,
    }),
    posts: relationship({
      ref: 'Post.category',
      ui: {
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: true,
    }),
  },
  hooks: {},
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
