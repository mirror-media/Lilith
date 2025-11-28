import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { integer, text, select, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

const listConfigurations = list({
  fields: {
    title: text({
      label: '標題',
    }),

    sortOrder: integer({
      label: '排序順位',
      isIndexed: 'unique',
    }),

    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      // 欄位級權限控制：Contributor 沒有 create/update 權限，因此只能使用預設值 'draft'
      access: {
        create: allowRoles(admin, moderator, editor),
        update: allowRoles(admin, moderator, editor),
      },
    }),

    topic: relationship({
      label: '專題',
      ref: 'Topic',
    }),

    url: text({
      label: '外部連結',
    }),

    logo: relationship({
      label: '首圖(必填)',
      ref: 'Image',
    }),

    mobile: relationship({
      label: '手機用圖（僅供外部連結使用）',
      ref: 'Image',
    }),

    tablet: relationship({
      label: '平板用圖（僅供外部連結使用）',
      ref: 'Image',
    }),
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, editor, contributor),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },

  ui: {
    labelField: 'sortOrder',
    listView: {
      initialColumns: ['sortOrder', 'topic'],
      initialSort: { field: 'sortOrder', direction: 'DESC' },
      pageSize: 50,
    },
  },

  hooks: {
    validateInput: async ({
      resolvedData,
      addValidationError,
      operation,
      item,
    }) => {
      // logo 為必填欄位
      const newItem = resolvedData as Record<string, any>
      const isConnecting = newItem.logo?.connect !== undefined
      const isDisconnecting = newItem.logo?.disconnect === true

      if (operation === 'create') {
        if (!isConnecting) {
          addValidationError('首圖(logo)為必填欄位')
        }
        return
      }

      if (operation === 'update') {
        // 檢查資料庫目前是否已有 logo
        const hasExistingLogo =
          item?.logoId !== null && item?.logoId !== undefined
        // 原本有圖，使用者想移除，但沒有補新圖
        if (hasExistingLogo && isDisconnecting && !isConnecting) {
          addValidationError('首圖(logo)為必填欄位，不能清空')
          return
        }
        // 原本沒圖 (可能是舊資料)，且使用者這次也沒有補圖
        if (!hasExistingLogo && !isConnecting) {
          addValidationError('此資料缺少首圖(logo)，請補上')
          return
        }
      }
    },
  },

  graphql: {
    plural: 'Sponsors',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
