import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  select,
  text,
  integer,
  checkbox,
} from '@keystone-6/core/fields'
const { allowRoles, admin, moderator } = utils.accessControl

const listConfigurations = list({
  fields: {
    sortOrder: integer({
      label: '排序順位',
      isIndexed: 'unique',
      validation: { isRequired: false },
    }),

    slug: text({
      label: 'Slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),

    name: text({
      label: '名稱',
      validation: { isRequired: true },
    }),

    ogTitle: text({
      label: 'FB 分享標題',
    }),

    ogDescription: text({
      label: 'FB 分享說明',
    }),

    ogImage: relationship({
      label: 'FB 分享縮圖',
      ref: 'Image',
    }),

    isFeatured: checkbox({
      label: '置頂',
      defaultValue: false,
    }),

    style: select({
      label: '樣式',
      type: 'string',
      options: [
        { label: 'normal', value: 'normal' },
        { label: 'highlight', value: 'highlight' },
      ],
      defaultValue: 'normal',
    }),
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'slug', 'name', 'sortOrder'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin, moderator),
    },
  },

  graphql: {
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
