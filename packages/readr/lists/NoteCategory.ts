// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, checkbox, select, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: '名稱',
      validation: {
        isRequired: true,
      },
      isIndexed: 'unique',
    }),
    title: text({
      label: '中文名稱',
      validation: { isRequired: true },
    }),
    isFeatured: checkbox({
      label: '置頂',
    }),
    state: select({
      options: [
        { label: 'inactive', value: 'inactive' },
        { label: 'active', value: 'active' },
        { label: 'archived', value: 'archived' },
      ],
    }),
    note: relationship({
      ref: 'ProjectNote.category',
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
