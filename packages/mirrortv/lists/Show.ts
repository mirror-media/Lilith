import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, relationship, checkbox, integer } from '@keystone-6/core/fields'

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
    }),
    picture: relationship({
      label: '圖片',
      ref: 'Image',
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
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },
  hooks: {
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

export default utils.addTrackingFields(listConfigurations)
