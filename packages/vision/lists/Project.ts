import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { integer, text, relationship, checkbox } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({ label: '名稱' }),
    slug: text(),
    weight: integer({
      isOrderable: () => true,
      label: '權重',
    }),
    active: checkbox({ label: '啟用', defaultValue: true }),
    posts: relationship({ ref: 'Post.project', many: true }),
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
