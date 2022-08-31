import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, json, select } from '@keystone-6/core/fields'

import config from '../config'

const { allowRoles, admin, moderator, editor } = utils.accessControl
enum Status {
  Published = 'published',
  Draft = 'draft',
  Scheduled = 'scheduled',
  Archived = 'archived',
}
const listConfigurations = list({
  fields: {
    name: text({
      label: '社會企業名稱',
      validation: {
        isRequired: true,
      },
    }),
    slogan: text({
      label: '口號',
    }),
    status: select({
      label: '狀態',
      type: 'enum',
      options: [
        { label: '出版', value: Status.Published },
        { label: '草稿', value: Status.Draft },
        { label: '排程', value: Status.Scheduled },
        { label: '下架', value: Status.Archived },
      ],
      defaultValue: 'draft',
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
      validation: {
        isRequired: true,
      },
    }),
    region: select({
      label: '地區',
      type: 'enum',
      options: config.region_options,
      // validation: {
      //   isRequired: true,
      // },
    }),
    section: relationship({
      label: '關注領域',
      ref: 'Section.resources',
      ui: {
        displayMode: 'select',
        hideCreate: true,
        labelField: 'name',
      },
      many: false,
    }),
    profile_photo: customFields.relationship({
      label: '企業頭貼',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    content: customFields.richTextEditor({
      label: '敘述',
    }),
    contact: customFields.richTextEditor({
      label: '聯絡方式',
    }),
    link: customFields.richTextEditor({
      label: '相關連結',
    }),
    relatedResources: relationship({
      label: '相關社會企業檔案',
      ref: 'Resource',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    apiDataContact: json({
      label: '資料庫使用(聯絡方式)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    apiDataLink: json({
      label: '資料庫使用（相關連結）',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: () => true,
      // update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
      const { content, contact, link } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      if (contact) {
        resolvedData.apiDataContact = customFields.draftConverter
          .convertToApiData(contact)
          .toJS()
      }
      if (link) {
        resolvedData.apiDataLink = customFields.draftConverter
          .convertToApiData(link)
          .toJS()
      }
      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
