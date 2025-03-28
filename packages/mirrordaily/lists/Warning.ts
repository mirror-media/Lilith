import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
    text,
  } from '@keystone-6/core/fields'
  
  const { allowRoles, admin, moderator, editor } = utils.accessControl

  const listConfigurations = list({
    fields: {
        content: text({ 
            label: '警語內容',
            validation: { isRequired: true },
            ui: {
                displayMode: 'textarea',
            },
            isIndexed: 'unique',
        }),
    },
    ui: {
      labelField: 'content',
      listView: {
        initialColumns: ['content'],
      },
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
  

  