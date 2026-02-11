import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, relationship, select } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'Slug',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    name: text({
      label: '索引名稱',
      validation: { isRequired: true },
    }),
    host: relationship({
      label: '主持人',
      ref: 'Contact',
      many: true,
    }),
    artshow: relationship({
      label: '相關正片',
      ref: 'ArtShow',
      many: true,
    }),
    show: relationship({
      label: '相關節目',
      ref: 'Show.sections',
      many: true,
    }),
    series: relationship({
      label: '相關單元',
      ref: 'Serie.section',
      many: true,
    }),
    introduction: text({
      label: '文字簡介',
      ui: { displayMode: 'textarea' },
    }),
    style: select({
      label: '樣式',
      options: [
        { value: 'default', label: '預設' },
        { value: 'art', label: '藝文' },
      ],
      defaultValue: 'default',
    }),
    trailerUrl: text({
      label: '預告清單(url)',
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
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'slug', 'style'],
      initialSort: { field: 'id', direction: 'DESC' },
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
