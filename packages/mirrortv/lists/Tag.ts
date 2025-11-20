import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, relationship } from '@keystone-6/core/fields'
import { v4 as uuidv4 } from 'uuid'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'Slug',
      isIndexed: 'unique',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === 'create' && !resolvedData.slug) {
            return uuidv4()
          }
          return resolvedData.slug
        },
      },
    }),
    name: text({
      label: '名稱',
      isIndexed: 'unique',
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
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'slug'],
      initialSort: { field: 'id', direction: 'DESC' },
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
