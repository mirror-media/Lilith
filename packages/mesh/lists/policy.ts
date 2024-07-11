import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, checkbox, select, integer, float } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '政策名稱(須符合[name]-(single)-[duration]格式)',
      validation: {
        match: { regex: /^(?:deposit|[a-zA-Z0-9]+(?:-single)?-[0-9]+)$/i },
        isRequired: true,
      },
    }),
    explanation: text({
      label: '政策說明',
      validation: {
        isRequired: false,
      },
    }),
    type: select({
        label: '選擇政策類型',
        type: 'enum',
        options: [
            {label: "儲值", value: "deposit"},
            {label: "解鎖所有媒體", value: "unlock_all_publishers"},
            {label: "解鎖單一媒體", value: "unlock_one_publisher"}
        ]
    }),
    unlockSingle: checkbox({
        label: "為解鎖單篇文章的政策",
        defaultValue: false
    }),
    publisher: relationship({ 
        label: "選擇政策影響之媒體",
        ref: 'Publisher', 
        many: false 
    }),
    duration: integer({
        label: "解鎖時間(天)"
    }),
    charge: float({
        label: "解鎖費用",
        defaultValue: 0,
    })
  },
  ui: {
    listView: {
      initialColumns: ['name', 'type', 'unlockSingle', 'publisher', 'duration'],
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  }
})

export default utils.addTrackingFields(listConfigurations)