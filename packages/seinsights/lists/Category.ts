import { utils, customFields } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { integer, text, relationship, select } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum CategoryStatus {
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
      label: 'slug英文名稱',
      isIndexed: 'unique',
      validation: {
        isRequired: true,
        match: {
          regex: new RegExp('^[a-zA-Z0-9-_]*$'),
          explanation: '限輸入英文、數字或_-符號',
        },
      },
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
      type: 'enum',
      options: [
        { label: 'active', value: CategoryStatus.Active },
        { label: 'inactive', value: CategoryStatus.Inactive },
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
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: true,
    }),
    specialfeatures: relationship({
      ref: 'Specialfeature.category',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: true,
    }),
    events: relationship({
      ref: 'Event.category',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: true,
    }),
    jobs: relationship({
      ref: 'Job.category',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: true,
    }),
    resources: relationship({
      ref: 'Resource.category',
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
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
      update: () => true,
      // update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
