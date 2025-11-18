import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text } from '@keystone-6/core/fields'

import { formatChangedList } from '../utils/formatChangedList'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '編輯者',
      validation: { isRequired: true },
      ui: { itemView: { fieldMode: 'read' } },
    }),

    operation: text({
      label: '動作',
      validation: { isRequired: true },
      ui: { itemView: { fieldMode: 'read' } },
    }),

    postSlug: text({
      label: '文章Slug',
      ui: { itemView: { fieldMode: 'read' } },
      isIndexed: true,
    }),

    changedList: text({
      label: '欄位更動內容',
      ui: {
        displayMode: 'textarea',
        itemView: { fieldMode: 'read' },
      },
      hooks: {
        resolveInput({ resolvedData, item }) {
          const raw = resolvedData.changedList || item?.changedList || ''
          return formatChangedList(raw)
        },
      },
    }),

    brief: customFields.richTextEditor({
      label: '已更動前言',
      ui: { itemView: { fieldMode: 'read' } },
      disabledButtons: [],
      website: 'mirrortv',
    }),

    content: customFields.richTextEditor({
      label: '已更動內文',
      ui: { itemView: { fieldMode: 'read' } },
      disabledButtons: [],
      website: 'mirrortv',
    }),
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator),
      update: allowRoles(admin),
      create: allowRoles(admin, contributor, editor, moderator),
      delete: allowRoles(admin),
    },
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'operation', 'createdAt'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
