import { graphql, list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import { text, select, timestamp, relationship, virtual } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const locationOptions = [
  { value: 'committee', label: '委員會' },
  { value: 'plenary', label: '院會' },
  { value: 'negotiation', label: '黨團協商' },
]

const typeOptions = [
  { value: 'budget_review', label: '預算審議' },
  { value: 'budget_unfreeze', label: '預算解凍' },
]

const listConfigurations = list({
  fields: {
    location: select({
      label: '地點',
      options: locationOptions,
    }),
    type: select({
      label: '類型',
      options: typeOptions,
    }),
    committee: relationship({
      label: '委員會',
	  many: true,
      ref: 'Committee',
    }),
    government: relationship({
      label: '部會',
	  many: true,
      ref: 'Government',
    }),
    meetingDate: timestamp({
      label: '會議日期',
    }),
    meetingRecordUrl: text({
      label: '會議記錄連結',
    }),
    description: text({
      label: '說明',
      ui: {
        displayMode: 'textarea',
      },
    }),
    displayName: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const data = await context.query.Meeting.findOne({
            where: { id: item.id },
            query: 'meetingDate committee { id displayName name session term { termNumber } }',
          })
          const meetingDate = data?.meetingDate
          const dateStr = meetingDate ? new Date(meetingDate).toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' }) : ''

          // 若 committee.displayName 存在就用它，否則組合 name + term + session
          const committee = data?.committee
          let committeeStr = ''
          if (committee) {
            if (committee.displayName) {
              committeeStr = committee.displayName
            } else {
              const termNumber = committee?.term?.termNumber
              const name = committee?.name || ''
              const session = committee?.session || ''
              committeeStr = `${name}${termNumber ? ` 第${termNumber}屆` : ''}${session ? ` 第${session}會期` : ''}`
            }
          }

          return `${dateStr}${committeeStr ? `｜${committeeStr}` : ''}`
        },
      }),
      ui: {
        description: '供後台標籤顯示用',
        listView: { fieldMode: 'hidden' },
      },
    }),
  },

  ui: {
    labelField: 'displayName',
    listView: {
      initialColumns: ['meetingDate', 'location', 'type', 'committee'],
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

export default listConfigurations
