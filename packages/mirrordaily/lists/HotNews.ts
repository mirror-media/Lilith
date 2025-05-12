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
    validateInput: ({ resolvedData, addValidationError, item }) => {
      const { hotnews, hotexternal, outlink } = resolvedData
      
      // 檢查 resolvedData 中是否有任何欄位被設定
      const hasNewHotnews = hotnews && 
        (typeof hotnews === 'object' && 'connect' in hotnews && hotnews.connect?.id)
      const hasNewHotexternal = hotexternal && 
        (typeof hotexternal === 'object' && 'connect' in hotexternal && hotexternal.connect?.id)
      const hasNewOutlink = outlink && outlink.trim() !== ''

      // 檢查是否有 disconnect 操作
      const isDisconnectHotnews = hotnews?.disconnect
      const isDisconnectHotexternal = hotexternal?.disconnect
      const isDisconnectOutlink = outlink === ''

      // 計算 resolvedData 中被設定的欄位數量
      const newFieldsSet = [hasNewHotnews, hasNewHotexternal, hasNewOutlink].filter(Boolean).length

      // 如果 resolvedData 中有多個欄位被設定，顯示錯誤
      if (newFieldsSet > 1) {
        addValidationError('新聞內容請擇一：快訊文章、快訊外部文章或外部連結網址')
        return
      }

      // 檢查最終狀態下有多少個欄位有值
      const finalHotnews = hasNewHotnews ? true : 
        (item?.hotnewsId && !isDisconnectHotnews)
      const finalHotexternal = hasNewHotexternal ? true : 
        (item?.hotexternalId && !isDisconnectHotexternal)
      const finalOutlink = hasNewOutlink ? true : 
        (item?.outlink && item.outlink.trim() !== '' && !isDisconnectOutlink)

      const finalFieldsSet = [finalHotnews, finalHotexternal, finalOutlink].filter(Boolean).length

      if (finalFieldsSet > 1) {
        // 如果是更新操作，且有多個欄位有值
        if (item) {
          // 檢查是否要從一個欄位切換到另一個欄位
          if (hasNewHotnews) {
            if (finalHotexternal) {
              addValidationError('請先清空快訊外部文章')
            }
            if (finalOutlink) {
              addValidationError('請先清空外部連結網址')
            }
          } else if (hasNewHotexternal) {
            if (finalHotnews) {
              addValidationError('請先清空快訊文章')
            }
            if (finalOutlink) {
              addValidationError('請先清空外部連結網址')
            }
          } else if (hasNewOutlink) {
            if (finalHotnews) {
              addValidationError('請先清空快訊文章')
            }
            if (finalHotexternal) {
              addValidationError('請先清空快訊外部文章')
            }
          } else {
            addValidationError('新聞內容請擇一：快訊文章、快訊外部文章或外部連結網址')
          }
        } else {
          addValidationError('新聞內容請擇一：快訊文章、快訊外部文章或外部連結網址')
        }
      }

      // 如果是更新操作，且沒有新的設定，檢查現有資料是否有多個欄位有值
      if (item && !hasNewHotnews && !hasNewHotexternal && !hasNewOutlink) {
        const hasExistingHotnews = item?.hotnewsId
        const hasExistingHotexternal = item?.hotexternalId
        const hasExistingOutlink = item?.outlink && item.outlink.trim() !== ''

        const existingFieldsSet = [
          hasExistingHotnews,
          hasExistingHotexternal,
          hasExistingOutlink
        ].filter(Boolean).length

        if (existingFieldsSet > 1) {
          addValidationError('新聞內容請擇一：快訊文章、快訊外部文章或外部連結網址')
        }
      }
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
