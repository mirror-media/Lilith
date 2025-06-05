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
        labelField: 'relation_display',
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
      const { choices, choiceexternal, outlink, state } = resolvedData
      
      // 檢查 resolvedData 中是否有任何欄位被設定
      const hasNewChoices = choices && 
        (typeof choices === 'object' && 'connect' in choices && choices.connect?.id)
      const hasNewChoiceexternal = choiceexternal && 
        (typeof choiceexternal === 'object' && 'connect' in choiceexternal && choiceexternal.connect?.id)
      const hasNewOutlink = outlink && outlink.trim() !== ''

      // 檢查是否有 disconnect 操作
      const isDisconnectChoices = choices?.disconnect
      const isDisconnectChoiceexternal = choiceexternal?.disconnect
      const isDisconnectOutlink = outlink === ''

      // 計算 resolvedData 中被設定的欄位數量
      const newFieldsSet = [hasNewChoices, hasNewChoiceexternal, hasNewOutlink].filter(Boolean).length

      // 如果 resolvedData 中有多個欄位被設定，顯示錯誤
      if (newFieldsSet > 1) {
        addValidationError('新聞內容請擇一：精選文章、精選外部文章或外部連結網址')
        return
      }

      // 檢查最終狀態下有多少個欄位有值
      const finalChoices = hasNewChoices ? true : 
        (item?.choicesId && !isDisconnectChoices)
      const finalChoiceexternal = hasNewChoiceexternal ? true : 
        (item?.choiceexternalId && !isDisconnectChoiceexternal)
      const finalOutlink = hasNewOutlink ? true : 
        (item?.outlink && item.outlink.trim() !== '' && !isDisconnectOutlink)

      const finalFieldsSet = [finalChoices, finalChoiceexternal, finalOutlink].filter(Boolean).length

      if (finalFieldsSet > 1) {
        // 如果是更新操作，且有多個欄位有值
        if (item) {
          // 檢查是否要從一個欄位切換到另一個欄位
          if (hasNewChoices) {
            if (finalChoiceexternal) {
              addValidationError('請先清空精選外部文章')
            }
            if (finalOutlink) {
              addValidationError('請先清空外部連結網址')
            }
          } else if (hasNewChoiceexternal) {
            if (finalChoices) {
              addValidationError('請先清空精選文章')
            }
            if (finalOutlink) {
              addValidationError('請先清空外部連結網址')
            }
          } else if (hasNewOutlink) {
            if (finalChoices) {
              addValidationError('請先清空精選文章')
            }
            if (finalChoiceexternal) {
              addValidationError('請先清空精選外部文章')
            }
          } else {
            addValidationError('新聞內容請擇一：精選文章、精選外部文章或外部連結網址')
          }
        } else {
          addValidationError('新聞內容請擇一：精選文章、精選外部文章或外部連結網址')
        }
      }

      // 如果是更新操作，且沒有新的設定，檢查現有資料是否有多個欄位有值
      if (item && !hasNewChoices && !hasNewChoiceexternal && !hasNewOutlink) {
        const hasExistingChoices = item?.choicesId
        const hasExistingChoiceexternal = item?.choiceexternalId
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

      // 檢查是否要發布或已經是發布狀態
      if (state === 'published') {
        // 檢查最終狀態下三個欄位是否都為空
        const finalChoicesEmpty = 
          (hasNewChoices ? false : 
            (isDisconnectChoices ? true : 
              (!item?.choicesId)))
        const finalChoiceexternalEmpty = 
          (hasNewChoiceexternal ? false : 
            (isDisconnectChoiceexternal ? true : 
              (!item?.choiceexternalId)))
        const finalOutlinkEmpty = 
          (hasNewOutlink ? false : 
            (isDisconnectOutlink ? true : 
              (!item?.outlink || item.outlink.trim() === '')))

        // 檢查是否有任何欄位被設定為空
        const isSettingAllEmpty = 
          (choices?.disconnect || (!hasNewChoices && !item?.choicesId)) &&
          (choiceexternal?.disconnect || (!hasNewChoiceexternal && !item?.choiceexternalId)) &&
          (isDisconnectOutlink || (!hasNewOutlink && (!item?.outlink || item.outlink.trim() === '')))

        if (isSettingAllEmpty) {
          addValidationError('發布狀態下，精選文章、精選外部文章和外部連結網址不能同時為空')
        }
      }
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
