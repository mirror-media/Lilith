import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: { isRequired: true },
    }),
    posts: relationship({
      ref: 'Post.tags',
      ui: {
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: true,
    }),
    specialfeatures: relationship({
      ref: 'Specialfeature.tags',
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
      ref: 'Job.tags',
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
      ref: 'Event.tags',
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
      ref: 'Resource.tags',
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
    isPopular: checkbox({
      label: '熱門標籤',
      defaultValue: false,
    }),
    isMemberOnly: checkbox({
      label: '會員專屬',
      defaultValue: false,
    }),
  },
  access: {
    operation: {
      query: () => true,
      // query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
