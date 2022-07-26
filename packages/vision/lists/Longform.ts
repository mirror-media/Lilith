import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  text,
  integer,
  relationship,
  select,
  json,
  timestamp,
  virtual,
} from '@keystone-6/core/fields'

const {
  allowRoles,
  admin,
  moderator,
  //editor,
  //owner,
} = utils.accessControl

enum UserRole {
  Admin = 'admin',
  Moderator = 'moderator',
  Editor = 'editor',
  Contributor = 'contributor',
}

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'slug（Longform 網址）',
      isIndexed: 'unique',
    }),
    titleSize: integer({
      label: '標題字級（Longform 專用）',
      validation: {
        max: 200,
        min: 20,
      },
    }),
    titleColor: text({
      label: '標題顏色Hex color code（Longform 專用）',
      defaultValue: '#000',
      validation: {
        match: {
          regex: new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
          explanation: '標題顏色格式不符合 Hex color code',
        },
      },
    }),
    subtitleSize: integer({
      label: '副標字級（Longform 專用）',
      validation: {
        max: 100,
        min: 14,
      },
    }),
    subtitleColor: text({
      label: '副標顏色Hex color code（Longform 專用）',
      defaultValue: '#000',
      validation: {
        match: {
          regex: new RegExp('^^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
          explanation: '副標顏色格式不符合 Hex color code',
        },
      },
    }),
    headLogo: customFields.relationship({
      label: '自訂 Logo（Longform 專用）',
      ref: 'Photo',
      // ui: {
      //     hideCreate: true,
      // },
      customConfig: {
        isImage: true,
      },
    }),
    heroMob: customFields.relationship({
      label: '手機首圖（Longform 專用）',
      ref: 'Photo',
      // ui: {
      //     hideCreate: true,
      // },
      customConfig: {
        isImage: true,
      },
    }),
    reporter: text({
      label: '記者（一般文章使用）',
      ui: { displayMode: 'textarea' },
    }),
    author: text({
      label: '作者（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    photographer: text({
      label: '攝影（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    video: text({
      label: '影音（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    designer: text({
      label: '設計（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    engineer: text({
      label: '工程（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
    data: text({
      label: '資料分析（Longform 專用）',
      ui: { displayMode: 'textarea' },
    }),
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'publishDate', 'slug', 'status'],
      initialSort: { field: 'publishDate', direction: 'DESC' },
      pageSize: 50,
    },
  },

  access: {
    operation: {
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
