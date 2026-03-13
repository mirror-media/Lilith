import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import {
  text,
  relationship,
  checkbox,
  integer,
  json,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'Slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    name: text({
      label: '節目名稱',
      validation: { isRequired: true },
    }),
    sections: relationship({
      label: '相關索引',
      ref: 'Section.show',
      many: true,
    }),
    isArtShow: checkbox({
      label: '藝文節目',
    }),
    bannerImg: relationship({
      label: 'banner',
      ref: 'Image',
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'file'],
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: {
          fields: ['name', 'file'],
        },
        views: './lists/views/sorted-relationship/index',
      },
    }),
    picture: relationship({
      label: '圖片',
      ref: 'Image',
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'file'],
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: {
          fields: ['name', 'file'],
        },
        views: './lists/views/sorted-relationship/index',
      },
    }),
    sortOrder: integer({
      label: '排序順位',
      isIndexed: 'unique',
    }),
    introduction: text({
      label: '簡介',
      ui: { displayMode: 'textarea' },
    }),
    hostName: relationship({
      label: '主持人姓名',
      ref: 'Contact.relatedShows',
      many: true,
      ui: {
        views: './lists/views/post/contact-relationship/index',
      },
    }),
    manualOrderOfHostNames: json({
      label: '主持人手動排序結果',
      isFilterable: false,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    staffName: relationship({
      label: '工作人員姓名',
      ref: 'Contact',
      many: true,
    }),
    igUrl: text({ label: 'IG 連結' }),
    facebookUrl: text({ label: 'facebook 粉專連結' }),
    playList01: text({ label: 'Youtube播放清單1' }),
    playList02: text({ label: 'Youtube播放清單2' }),
    listShow: checkbox({
      label: '首頁隱藏',
    }),
    trailerPlaylist: text({
      label: '預告清單',
    }),
  },
  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const data = resolvedData as Record<string, any>

      const orderFields = ['manualOrderOfHostNames']

      for (const fieldKey of orderFields) {
        if (data[fieldKey]) {
          const incomingData = data[fieldKey]
          try {
            if (typeof incomingData === 'string') {
              data[fieldKey] = JSON.parse(incomingData)
            } else {
              data[fieldKey] = incomingData
            }
          } catch (e) {
            console.error(`[Error] 欄位 ${fieldKey} 順序格式錯誤:`, e)
          }
        }
      }

      return data
    },

    validateInput: async ({
      resolvedData,
      addValidationError,
      item,
      operation,
    }) => {
      if (!resolvedData) return
      if (operation === 'create' && !resolvedData.bannerImg) {
        addValidationError('「banner」欄位為必填')
      }
      if (operation === 'update') {
        if (resolvedData.bannerImg?.disconnect && item.bannerImgId) {
          addValidationError('「banner」欄位為必填，不可移除')
        }
      }
    },
    beforeOperation: async ({ resolvedData }) => {
      if (!resolvedData) {
        return
      }
      if (resolvedData.introduction) {
        console.log(resolvedData.introduction)
      }
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['sortOrder', 'name', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
    },
  },
})

// export default utils.addTrackingFields(listConfigurations)
export default utils.addManualOrderRelationshipFields(
  [
    {
      fieldName: 'manualOrderOfHostNames',
      targetFieldName: 'hostName',
      targetListName: 'Contact',
      targetListLabelField: 'name',
    },
  ],
  utils.addTrackingFields(listConfigurations)
)
