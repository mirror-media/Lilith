import { list } from '@keystone-6/core'
import { customFields, utils } from '@mirrormedia/lilith-core'
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
      label: '單元名稱',
      validation: { isRequired: true },
    }),

    heroImage: relationship({
      label: '首圖',
      ref: 'Image',
    }),
    introduction: customFields.richTextEditor({
      label: '內文',
      website: 'mirrortv',
    }),
    section: relationship({
      label: '相關索引',
      ref: 'Section.series',
      many: true,
    }),
    post: relationship({
      label: '相關單集',
      ref: 'ArtShow.series',
      many: true,
    }),
    relatedContacts: relationship({
      label: '關聯主持人',
      ref: 'Contact.relatedSeries',
      many: true,
    }),
    style: select({
      label: '樣式',
      options: [
        { value: 'default', label: '預設' },
        { value: 'acting', label: '誰來演戲' },
      ],
      defaultValue: 'default',
    }),
    introductionApiData: text({
      label: 'Introduction API Data',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    introductionHtml: text({
      label: 'Introduction HTML',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
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
      if (!resolvedData) return
      const { introduction } = resolvedData
      if (introduction) {
        try {
          const introductionApiData =
            customFields.draftConverter.convertToApiData(introduction)
          resolvedData.introductionApiData = JSON.stringify(
            introductionApiData.toJS()
          )
        } catch (err) {
          console.error('DraftJS conversion failed:', err)
        }
      }
      return resolvedData
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'slug', 'updatedAt'],
      initialSort: { field: 'updatedAt', direction: 'DESC' },
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
