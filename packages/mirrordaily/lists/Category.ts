import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  checkbox,
  select,
  text,
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
	  isIndexed: true,
      validation: { isRequired: true },
      ui: { displayMode: 'segmented-control' },
      defaultValue: 'active',
    }),
    heroImage: relationship({
      label: 'Banner圖片',
      ref: 'Photo',
    }),
    sections: relationship({
      ref: 'Section.categories',
      many: true,
    }),
    posts: relationship({
      ref: 'Post.categories',
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    isMemberOnly: checkbox({
      label: '會員文章',
      defaultValue: false,
    }),
  },
  ui: {
    labelField: 'slug',
    listView: {
      initialColumns: ['id', 'slug', 'name', 'order'],
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
