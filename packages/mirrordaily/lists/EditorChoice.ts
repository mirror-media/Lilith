import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, select, integer, text } from '@keystone-6/core/fields'
import { State } from '../type'

const { allowRoles, admin } = utils.accessControl

enum EditorChoiceState {
  Draft = State.Draft,
  Published = State.Published,
  Scheduled = State.Scheduled,
  Archived = State.Archived,
}

const listConfigurations = list({
  fields: {
    order: integer({
      label: '排序',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    outlink: text({
      label: '外部連結網址',
    }),
    choices: relationship({
      label: '精選文章',
      ref: 'Post',
      many: false,
      ui: {
        views: './lists/views/sorted-relationship-filter-draft-selfpost/index',
        labelField: 'title',
      },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: EditorChoiceState.Draft },
        { label: '已發布', value: EditorChoiceState.Published },
        { label: '預約發佈', value: EditorChoiceState.Scheduled },
        { label: '下線', value: EditorChoiceState.Archived },
      ],
      defaultValue: EditorChoiceState.Draft,
      isIndexed: true,
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        displayMode: 'cards',
        cardFields: ['imageFile'],
        linkToItem: true,
        inlineConnect: true,
        views: './lists/views/sorted-relationship/index',
      },
    }),
  },
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['id', 'order', 'choices'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin),
      update: allowRoles(admin),
      create: allowRoles(admin),
      delete: allowRoles(admin),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
