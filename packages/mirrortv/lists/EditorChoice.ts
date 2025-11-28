import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  integer,
  relationship,
  select,
  calendarDay,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor, contributor, owner } =
  utils.accessControl

import envVar from '../environment-variables'
import { ACL, UserRole, type Session } from '../type'
// 前端匿名或不同環境的 filter
function filterByServerType(roles: UserRole[]) {
  return ({ session }: { session?: Session }) => {
    switch (envVar.accessControlStrategy) {
      case ACL.GraphQL:
        // 前端網站只顯示已發布或可見項目
        return { state: { in: ['published', 'invisible'] } }
      case ACL.Preview:
        // Preview 顯示全部
        return true
      case ACL.CMS:
      default:
        // CMS 只有登入角色可見
        return (
          session?.data?.role !== undefined && roles.includes(session.data.role)
        )
    }
  }
}

const listConfigurations = list({
  fields: {
    sortOrder: integer({
      label: '排序順位',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),

    choice: relationship({
      label: '精選文章',
      ref: 'Post',
    }),

    externalChoice: relationship({
      label: '外部文章',
      ref: 'External',
    }),

    publishedDate: calendarDay({
      label: '上架日期（預設隔日）',
    }),

    expiredDate: calendarDay({
      label: '下架日期（預設隔一日）',
    }),

    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Archived', value: 'archived' },
        { label: 'Invisible', value: 'invisible' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor, owner),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
    filter: {
      // 針對前端匿名或不同 server type 做過濾
      query: filterByServerType([
        UserRole.Admin,
        UserRole.Moderator,
        UserRole.Editor,
        UserRole.Contributor,
      ]),
    },
  },

  hooks: {
    validateInput: async ({ resolvedData, addValidationError, item }) => {
      const newItem = resolvedData as any
      const existingItem = item as any

      // 檢查新的輸入值
      const hasNewChoice = newItem.choice?.connect !== undefined
      const hasNewExternalChoice = newItem.externalChoice?.connect !== undefined
      const isClearingChoice = newItem.choice?.disconnect === true
      const isClearingExternalChoice =
        newItem.externalChoice?.disconnect === true

      // 檢查「資料庫目前是否有值」
      const hasExistingChoice =
        existingItem?.choiceId !== null && existingItem?.choiceId !== undefined
      const hasExistingExternalChoice =
        existingItem?.externalChoiceId !== null &&
        existingItem?.externalChoiceId !== undefined

      // 檢查是否同時有多個欄位被設定
      if (hasNewChoice && hasNewExternalChoice) {
        console.log('Validation error: both new fields have values')
        addValidationError('新聞內容請擇一：精選文章、精選外部文章')
        return
      }

      // 檢查是否要從一個欄位切換到另一個欄位
      // 想設定 Choice，但原本有 External
      if (
        hasNewChoice &&
        hasExistingExternalChoice &&
        !isClearingExternalChoice
      ) {
        console.log(
          'Validation error: cannot set choice when externalChoice exists'
        )
        addValidationError('請先清空精選外部文章')
        return
      }

      // 想設定 External，但原本有 Choice
      if (hasNewExternalChoice && hasExistingChoice && !isClearingChoice) {
        console.log(
          'Validation error: cannot set externalChoice when choice exists'
        )
        addValidationError('請先清空精選文章')
        return
      }

      // 檢查是否要發布或已經是發布狀態
      const targetState = newItem.state || existingItem?.state
      const isPublished = targetState === 'published'

      if (isPublished) {
        // 如果正在清除某個欄位，則檢查另一個欄位是否有值
        const finalHasChoice =
          hasNewChoice || (hasExistingChoice && !isClearingChoice)
        const finalHasExternalChoice =
          hasNewExternalChoice ||
          (hasExistingExternalChoice && !isClearingExternalChoice)

        if (!finalHasChoice && !finalHasExternalChoice) {
          console.log('Validation error: no values in published state')
          addValidationError('發布狀態下，精選文章、精選外部文章不能同時為空')
          return
        }
      }

      // 日期驗證邏輯(publishedDate 要早於 expiredDate)
      const publishedDate = newItem.publishedDate ?? existingItem?.publishedDate
      const expiredDate = newItem.expiredDate ?? existingItem?.expiredDate

      if (publishedDate && expiredDate) {
        const pubDate = new Date(publishedDate)
        const expDate = new Date(expiredDate)

        if (expDate <= pubDate) {
          addValidationError('下架日期必須晚於上架日期')
          return
        }
      }
    },
  },

  ui: {
    labelField: 'sortOrder',
    listView: {
      initialColumns: [
        'sortOrder',
        'choice',
        'externalChoice',
        'state',
        'publishedDate',
      ],
      initialSort: { field: 'sortOrder', direction: 'ASC' },
      pageSize: 50,
    },
  },

  graphql: {
    plural: 'EditorChoices',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
