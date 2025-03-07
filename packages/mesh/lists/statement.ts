import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
const { allowRoles, admin, moderator, editor } = utils.accessControl
import { text, relationship, select, float, timestamp} from '@keystone-6/core/fields'

const listConfigurations = list({
  fields: {
    title: text({
        label: '標題',
        validation: {
            isRequired: false
        }
    }),
    publisher: relationship({ 
        label: "媒體",
        ref: 'Publisher.statements', 
        many: false 
    }),
    type: select({
        label: "種類",
        type: "enum",  
        options: [
            { label: '月報', value: 'month' },
            { label: '媒體期報', value: 'media' },
            { label: '半年報', value: 'semi_annual'}
        ],
    }),
    url: text({
        label: "檔案連結",
        validation: {
            isRequired: true,
        }
    }),
    start_date: timestamp({
        label: "計算起始時間",
        validation: { 
            isRequired: false 
        } 
    }),
    end_date: timestamp({
        label: "計算結束時間",
        validation: { 
            isRequired: false 
        } 
    }),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'type', 'start_date', 'end_date'],
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