// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  integer,
  text,
  select,
  timestamp,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      validation: { isRequired: true },
      label: '專題名稱',
    }),
    subtitle: text({
      label: '副標',
      validation: { isRequired: false },
    }),
    sortOrder: integer({
      label: '排序順位',
    }),
    state: select({
      isIndexed: true,
      defaultValue: 'draft',
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
        { label: 'scheduled', value: 'scheduled' },
        { label: 'invisiable', value: 'invisiable' },
        { label: 'archived', value: 'archived' },
      ],
      label: '狀態',
    }),
    description: text({
      label: '描述',
      ui: { displayMode: 'textarea' },
    }),
    featurePost: relationship({
      many: false,
      label: '特色專題',
      ref: 'Post',
    }),
    publishTime: timestamp({
      label: '發布時間',
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
