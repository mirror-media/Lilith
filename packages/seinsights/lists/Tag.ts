import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: { isRequired: true },
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
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: true,
    }),
    jobs: relationship({
      ref: 'Job.tags',
      ui: {
        itemView: {
          fieldMode: 'hidden',
        },
      },
      many: true,
    }),
    events: relationship({
      ref: 'Event.tags',
      ui: {
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
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
