// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  integer,
  select,
  text,
  timestamp,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    sortOrder: integer({
      label: '排序順位',
    }),
    name: text({
      label: '標題',
    }),
    description: text({
      label: '描述',
    }),
    choices: relationship({
      ref: 'Post',
      many: false,
      label: '精選文章',
    }),
    link: text({
      label: '連結',
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
    }),
    state: select({
      defaultValue: 'draft',
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
        { label: 'scheduled', value: 'scheduled' },
        { label: 'archived', value: 'archived' },
        { label: 'invisible', value: 'invisible' },
      ],
      isIndexed: true,
      label: '狀態',
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
