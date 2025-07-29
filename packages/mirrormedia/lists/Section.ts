import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  select,
  checkbox,
  relationship,
  integer,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    description: text({
      label: '簡介',
    }),
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    order: integer({
      label: '排序',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    state: select({
      options: [
        { label: 'active', value: 'active' },
        { label: 'inactive', value: 'inactive' },
      ],
      validation: { isRequired: true },
      isIndexed: true,
      ui: { displayMode: 'segmented-control' },
      defaultValue: 'active',
    }),
    isFeatured: checkbox({
      label: '置頂',
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '圖片',
    }),
    categories: relationship({
      ref: 'Category.sections',
      label: '分類',
      many: true,
    }),
    posts: relationship({
      ref: 'Post.sections',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    externals: relationship({
      ref: 'External.sections',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    topics: relationship({
      ref: 'Topic.sections',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    labelField: 'slug',
    listView: {
      initialColumns: ['id', 'slug', 'name', 'description'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
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
