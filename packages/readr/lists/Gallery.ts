// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    data: relationship({
      ref: 'DataSet.gallery',
      many: true,
      label: '所使用資料',
    }),
    link: text({
      label: '連結',
    }),
    heroImage: relationship({
      ref: 'Photo',
      many: false,
      label: '首圖',
    }),
    writer: relationship({
      ref: 'Author.gallery',
      many: false,
      label: '相關作者',
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
