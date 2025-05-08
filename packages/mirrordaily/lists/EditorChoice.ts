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
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
	  }
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
    choiceexternal: relationship({
      label: '精選外部文章',
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
  hooks: {
    validateInput: ({ resolvedData, addValidationError, item }) => {
      const { choices, choiceexternal, outlink } = resolvedData
      
      // 檢查 resolvedData 中是否有任何欄位被設定
      const hasNewChoices = choices && 
        (typeof choices === 'object' && 'connect' in choices && choices.connect?.id)
      const hasNewChoiceexternal = choiceexternal && 
        (typeof choiceexternal === 'object' && 'connect' in choiceexternal && choiceexternal.connect?.id)
      const hasNewOutlink = outlink && outlink.trim() !== ''

      // 計算 resolvedData 中被設定的欄位數量
      const newFieldsSet = [hasNewChoices, hasNewChoiceexternal, hasNewOutlink].filter(Boolean).length

      // 如果 resolvedData 中有多個欄位被設定，顯示錯誤
      if (newFieldsSet > 1) {
        addValidationError('新聞內容請擇一：精選文章、精選外部文章或外部連結網址')
        return
      }

      // 如果是更新操作（item 存在），且 resolvedData 中有任何欄位被設定，確保其他欄位都被 disconnect
      if (item && newFieldsSet === 1) {
        if (hasNewChoices && !choiceexternal?.disconnect) {
          addValidationError('請先清空精選外部文章')
        }
        if (hasNewChoices && outlink && outlink.trim() !== '') {
          addValidationError('請先清空外部連結網址')
        }
        if (hasNewChoiceexternal && !choices?.disconnect) {
          addValidationError('請先清空精選文章')
        }
        if (hasNewChoiceexternal && outlink && outlink.trim() !== '') {
          addValidationError('請先清空外部連結網址')
        }
        if (hasNewOutlink && !choices?.disconnect) {
          addValidationError('請先清空精選文章')
        }
        if (hasNewOutlink && !choiceexternal?.disconnect) {
          addValidationError('請先清空精選外部文章')
        }
        return
      }

      // 如果是更新操作（item 存在），且 resolvedData 中沒有欄位被設定，檢查 item 中是否有多個欄位同時存在
      if (item) {
        const hasExistingChoices = item?.choices?.id
        const hasExistingChoiceexternal = item?.choiceexternal?.id
        const hasExistingOutlink = item?.outlink && item.outlink.trim() !== ''

        const existingFieldsSet = [
          hasExistingChoices,
          hasExistingChoiceexternal,
          hasExistingOutlink
        ].filter(Boolean).length

        if (existingFieldsSet > 1) {
          addValidationError('新聞內容請擇一：精選文章、精選外部文章或外部連結網址')
        }
      }
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
