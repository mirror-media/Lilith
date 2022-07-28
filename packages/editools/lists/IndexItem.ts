import config from '../config'
// eslint-disable-next-line
// @ts-ignore
import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, image, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '文字',
      validation: { isRequired: true },
    }),
    url: text({
      label: '網址',
      validation: { isRequired: true },
    }),
    imageFile: image(),
    color: text({
      label: '色塊色碼（沒有圖）',
      validation: { isRequired: true },
    }),
	index: relationship({
	  label: '索引列表',
	  ref: 'InlineIndex.index',
	  many: true,
	}),
  },
  ui: {
    listView: {
      initialSort: { field: 'id', direction: 'DESC' },
      initialColumns: ['name', 'url'],
      pageSize: 50,
    },
    labelField: 'name',
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
