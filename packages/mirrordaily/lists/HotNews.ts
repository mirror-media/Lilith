import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, select, integer, text } from '@keystone-6/core/fields'
import { State } from '../type'

const { allowRoles, admin } = utils.accessControl

enum HotNewsState {
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
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
	  }
    }),
    hotnews: relationship({
      label: '快訊文章',
      ref: 'Post',
      many: false,
      ui: {
        views: './lists/views/sorted-relationship-filter-draft-selfpost/index',
        labelField: 'title',
      },
    }),
    hotexternal: relationship({
      label: '快訊外部文章',
      ref: 'External',
      many: false,
      ui: {
        views: './lists/views/sorted-relationship-filter-draft-selfpost/index',
        labelField: 'title',
      },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: HotNewsState.Draft },
        { label: '已發布', value: HotNewsState.Published },
        { label: '預約發佈', value: HotNewsState.Scheduled },
        { label: '下線', value: HotNewsState.Archived },
      ],
      defaultValue: HotNewsState.Draft,
      isIndexed: true,
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
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
      initialColumns: ['id', 'order', 'hotnews'],
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
  hooks: {
    validateInput: ({ resolvedData, addValidationError }) => {
      const { hotnews,  hotexternal, outlink } = resolvedData
      if ((typeof(hotnews) !== 'undefined' && typeof(hotexternal) !== 'undefined') || (typeof(hotnews) !== 'undefined' && outlink !== '') || (typeof(hotexternal) !== 'undefined' && outline !== '')) {
        addValidationError('新聞內容請擇一')
      }
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
