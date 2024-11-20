import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  timestamp,
  checkbox,
  json,
} from '@keystone-6/core/fields'
import { checkAccessToken } from '../utils/accessToken'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({ validation: { isRequired: false } }),
    url: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    description: text({
      validation: { isRequired: false },
      ui: { displayMode: 'textarea' },
    }),
    author: text({
      validation: { isRequired: false },
    }),
    source: relationship({ ref: 'Publisher', many: false }),
    category: relationship({ ref: 'Category', many: false }),
    duration: text({ validation: { isRequired: false } }),
    pick: relationship({ ref: 'Pick.podcast', many: true }),
    comment: relationship({ ref: 'Comment.podcast', many: true }),
    published_date: timestamp({ validation: { isRequired: false } }),
    og_title: text({ validation: { isRequired: false } }),
    og_image: text({ validation: { isRequired: false } }),
    og_description: text({ validation: { isRequired: false } }),
    isMember: checkbox({
      defaultValue: false,
    }),
    origid: text({}),
    is_active: checkbox({
      defaultValue: true,
    }),
    tag: relationship({ ref: 'Tag', many: true }),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'url', "source", "author"],
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
})

export default utils.addTrackingFields(listConfigurations)
