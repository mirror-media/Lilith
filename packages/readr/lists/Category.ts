// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, checkbox, select, text } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: '名稱',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    title: text({
      label: '中文名稱',
      validation: { isRequired: true },
    }),
    isFeatured: checkbox({
      label: '置頂',
    }),
    state: select({
      options: [
        { label: 'inactive', value: 'inactive' },
        { label: 'active', value: 'active' },
        { label: 'archived', value: 'archived' },
      ],
    }),
    style: select({
      options: [
        { label: 'feature', value: 'feature' },
        { label: 'listing', value: 'listing' },
        { label: 'tile', value: 'tile' },
      ],
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
    }),
    ogTitle: text({
      label: 'FB分享標題',
      validation: { isRequired: false },
    }),
    ogDescription: text({
      label: 'FB分享說明',
      validation: { isRequired: false },
    }),
    ogImage: relationship({
      label: 'FB分享縮圖',
      ref: 'Photo',
    }),
    css: text({
      label: 'CSS',
      ui: { displayMode: 'textarea' },
    }),
    javascript: text({
      label: 'javascript',
      ui: { displayMode: 'textarea' },
    }),
    relatedPost: relationship({
      ref: 'Post',
      many: true,
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
