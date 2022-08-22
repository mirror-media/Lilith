import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, json, select } from '@keystone-6/core/fields'

import config from '../config'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '社會企業名稱',
      validation: {
        isRequired: true,
      },
    }),
    region: select({
      label: '地區',
      type: 'enum',
      options: config.region_options,
      validation: {
        isRequired: true,
      },
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
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
