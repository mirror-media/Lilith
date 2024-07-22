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
      isIndexed: 'unique',
    }),
    customId: text({
      label: 'customId',
      validation: {
        isRequired: true,
      },
      isIndexed: 'unique',
    }),
    name: text({
      validation: { isRequired: true },
    }),
    nickname: text({ validation: { isRequired: true } }),
    avatar: text({ validation: { isRequired: false } }),
    intro: text({ validation: { isRequired: false } }),
    avatar_image: relationship({
      label: 'PFP',
      ref: 'Photo',
    }),
    wallet: text({
      label: '區塊鏈錢包'
    }),
    email: text({
      validation: { isRequired: false },
      isFilterable: true,
      isIndexed: 'unique',
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
    block: relationship({
      ref: 'Member.blocked',
      many: true,
    }),
    blocked: relationship({
      ref: 'Member.block',
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
      ref: 'InvitationCode.send',
      many: true,
    }),
    invited_by: relationship({
      ref: 'InvitationCode.receive',
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
