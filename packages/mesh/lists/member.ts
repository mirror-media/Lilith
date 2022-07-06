import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    firebaseId: text({
      label: 'firebaseId',
      validation: {
        isRequired: true,
      },
      isindexed: 'unique',
    }),
    customId: text({
      label: 'customId',
      validation: {
        isRequired: true,
      },
      isindexed: 'unique',
    }),
    name: text({
      validation: { isRequired: true },
      isindexed: 'unique',
    }),
    nickname: text({ validation: { isRequired: true } }),
    avatar: text({ validation: { isRequired: false } }),
    intro: text({ validation: { isRequired: false } }),
    email: text({
      validation: { isRequired: false },
      isFilterable: true,
    }),
    is_active: checkbox({
      defaultValue: true,
    }),
    verified: checkbox({
      defaultValue: false,
    }),
    pick: relationship({
      ref: 'Pick.member',
      many: true,
    }),
    comment: relationship({
      ref: 'Comment',
      many: true,
    }),
    member_like: relationship({
      ref: 'Comment.like',
      many: true,
    }),
    follower: relationship({
      ref: 'Member.following',
      many: true,
    }),
    following: relationship({
      ref: 'Member.follower',
      many: true,
    }),
    following_category: relationship({
      ref: 'Category',
      many: true,
    }),
    following_collection: relationship({
      ref: 'Collection',
      many: true,
    }),
    follow_publisher: relationship({
      ref: 'Publisher.follower',
      many: true,
    }),
    invited: relationship({
      ref: 'InvitationCode.receive',
      many: true,
    }),
    invited_by: relationship({
      ref: 'InvitationCode.send',
      many: false,
    }),
    create_collection: relationship({
      ref: 'CollectionMember.added_by',
      many: true,
    }),
    modify_collection: relationship({
      ref: 'CollectionMember.updated_by',
      many: true,
    }),
  },
  ui: {
    listView: {
      initialColumns: ['name', 'email'],
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
