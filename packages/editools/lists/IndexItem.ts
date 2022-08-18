// eslint-disable-next-line
// @ts-ignore
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  text,
  image,
  relationship,
  virtual,
  integer,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    slug: text({
      label: 'slug',
      validation: { isRequired: true },
    }),
    order: integer({
      label: '排序',
      validation: { isRequired: true },
    }),
    imageFile: image({
      label: '圖片',
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor),
          update: allowRoles(admin, moderator),
          create: allowRoles(admin, moderator),
          delete: allowRoles(admin),
        },
      },
    }),
    imageLink: text(),
    color: text({
      label: '色塊色碼（沒有圖）',
      defaultValue: '#fff',
    }),
    index: relationship({
      label: '索引列表',
      ref: 'InlineIndex.index',
      many: true,
    }),
    originCode: text({
      label: '原始 embed code',
      ui: {
        displayMode: 'textarea',
      },
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          return `<div id='${item.slug}' style='scroll-margin-top: 100px;'>${item.originCode}</div>`
        },
      }),
    }),
  },
  ui: {
    listView: {
      initialSort: { field: 'id', direction: 'DESC' },
      initialColumns: ['name', 'slug', 'order'],
      pageSize: 50,
    },
    labelField: 'name',
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
