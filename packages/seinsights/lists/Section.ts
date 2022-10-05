import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  integer,
  text,
  relationship,
  checkbox,
  select,
} from '@keystone-6/core/fields'
const { allowRoles, admin, moderator, editor } = utils.accessControl

enum SectionStatus {
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
    }),
    status: select({
      type: 'enum',
      options: [
        { label: 'active', value: SectionStatus.Active },
        { label: 'inactive', value: SectionStatus.Inactive },
      ],
      validation: {
        isRequired: true,
      },
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    isPresent: checkbox({
      label: '前台顯示',
      defaultValue: true,
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
    category: relationship({
      ref: 'Category.section',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: true,
    }),
    posts: relationship({
      ref: 'Post.section',
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
      ref: 'Specialfeature.section',
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
      ref: 'Event.section',
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
      ref: 'Job.section',
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
      ref: 'Resource.section',
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
    specialfeatureLists: relationship({
      ref: 'SpecialfeatureList.section',
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
