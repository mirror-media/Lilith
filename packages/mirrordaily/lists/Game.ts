import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  timestamp,
  text,
  select,
  checkbox,
  integer,
  relationship,
} from '@keystone-6/core/fields'
import { State } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum GameState {
  Draft = State.Draft,
  Published = State.Published,
}

const listConfigurations = list({
  fields: {
    name: text({
      isIndexed: true,
      validation: { isRequired: true },
    }),
    state: select({
      options: [
        { label: '草稿', value: GameState.Draft },
        { label: '發布', value: GameState.Published },
      ],
      label: '狀態',
      defaultValue: GameState.Draft,
      isIndexed: true,
    }),
    publishedDate: timestamp({
      label: '發佈日期',
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
    link: text({
      label: '連結',
    }),
    isFeatured: checkbox({
      label: '置頂',
      defaultValue: false,
    }),
    descriptions: text({
      label: '說明',
      isFilterable: false,
      validation: { isRequired: false },
    }),
    sortOrder: integer({
      label: '排序',
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'state', 'sortOrder'],
      initialSort: { field: 'sortOrder', direction: 'DESC' },
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
