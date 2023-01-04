import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { json } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl


const listConfigurations = list({
  fields: {
    aboutUs: customFields.richTextEditor({
      label: 'about us',
      disabledButtons: ['header-four', 'code', 'code-block', 'annotation', 'info-box'],
    }),
    
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
  },
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['id'],
    },
  },

  access: {
    operation: {
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { aboutUs } = resolvedData
      if (aboutUs) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(aboutUs)
          .toJS()
      }
      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
