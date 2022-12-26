// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  timestamp,
  checkbox,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    firebaseId: text({
      label: 'Firebase ID',
      isIndexed: 'unique',
      db: {
        isNullable: true,
      },
    }),
    isActive: checkbox({
      label: '是否啟用',
      defaultValue: false,
    }),
    hasSetCategories: checkbox({
      label: '初次追蹤主題設定',
      defaultValue: false,
    }),
    email: text({
      label: 'E-mail',
      isIndexed: 'unique',
      validation: {
        isRequired: true,
      },
    }),
    donationType: text({
      label: '贊助方案',
    }),
    beginDate: timestamp({
      label: '開始贊助日期',
      defaultValue: { kind: 'now' },
    }),
    endDate: timestamp({
      label: '結束贊助日期',
    }),
    categories: relationship({
      label: '追蹤主題',
      ref: 'Category',
      many: true,
      ui: {
        labelField: 'name',
      },
    }),
    favoritePosts: relationship({
      label: '收藏文章',
      ref: 'Post',
      many: true,
      ui: {
        labelField: 'title',
      },
    }),
  },
  ui: {
    labelField: 'email',
    listView: {
      initialColumns: ['email', 'isActive', 'beginDate'],
      initialSort: { field: 'beginDate', direction: 'DESC' },
    },
  },
  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
