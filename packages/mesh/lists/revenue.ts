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
        ref: 'Publisher', 
        many: false 
    }),
    type: select({
        label: "種類",
        type: "enum",  
        options: [
            { label: '文章廣告分潤', value: 'story_ad_revenue' },
            { label: '基金池分潤', value: 'mutual_fund_revenue' },
        ],
    }),
    value: float({
        label: "分潤金額",
        validation: {
            isRequired: true,
        }
    }),
    start_date: timestamp({
        label: "資料起始時間",
        validation: { 
            isRequired: false 
        } 
    }),
    end_date: timestamp({
        label: "資料結束時間",
        validation: { 
            isRequired: false 
        } 
    }),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'publisher', 'type', 'value'],
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