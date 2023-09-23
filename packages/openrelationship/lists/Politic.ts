import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { checkbox, select, relationship, json, timestamp, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    person: relationship({
      label: '候選人-選舉',
      many: false,
      ref: 'PersonElection',
    }),
    thread_parent: relationship({
      label: 'Thread',
      many: false,
      ref: 'Politic',
    }),
    desc: text({ 
	  label: '政見', 
	  ui: {
		displayMode: 'textarea',
	  },
	}),
    content: text({ 
	  label: '政策補充說明', 
	  ui: {
		displayMode: 'textarea',
	  },
	}),
    current_progress: select({
      defaultValue: 'no-progress', 
      options: [ 
        { label: '還沒開始', value: 'no-progress' }, 
        { label: '進行中', value: 'in-progress' }, 
        { label: '卡關中', value: 'in-trouble' },
        { label: '已完成', value: 'complete' },
      ], 
      label: '政見進度',
    }),
    positionChangeSummary: text({
      label: '立場變化（摘要）',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
	positionChange: relationship({
	  label: '立場變化',
	  many: true,
	  ref: 'PoliticPositionChange.politic',
	}),
    factCheckSummary: text({
      label: '事實查核（摘要）',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
	factCheck: relationship({
	  label: '事實查核',
	  many: true,
	  ref: 'PoliticFactCheck.politic',
	}),
    dispute: text({
      label: '爭議事件',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
    source: text({ 
	  label: '資料來源',
	  ui: {
		displayMode: 'textarea',
	  },
	}),
    contributer: text({ 
	  label: '資料提供',
	  ui: {
		displayMode: 'textarea',
	  },
	}),
    timeline: relationship({
      label: '時間軸',
      many: true,
      ref: 'PoliticTimeline.politic',
    }),
    expertPointSummary: text({
      label: '專家觀點（摘要）',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
	expertPoint: relationship({
	  label: '專家觀點',
	  many: true,
	  ref: 'PoliticExpert.politic',
	}),
    repeatSummary: text({
      label: '專家觀點（摘要）',
	  ui: {
		displayMode: 'textarea',
	  },
    }),
	repeat: relationship({
	  label: '重複政見',
	  many: true,
	  ref: 'PoliticRepeat.politic',
	}),
	status: select({
	  options: [
	    { label: '已確認', value: 'verified' },
	    { label: '未確認', value: 'notverified' },
	  ],
	  defaultValue: 'notverified',
	  label: '狀態',
	}),
    tag: relationship({
      label: '標籤',
      many: false,
      ref: 'Tag',
    }),
	reviewed: checkbox({
	  defaultValue: false,
	  label: '檢閱',
	}),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
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
	beforeOperation: async ({
	  operation,
	  resolvedData,
	  context,
	}) => { /* ... */ 
	  if (operation === 'create' && context.session?.data?.role === 'admin') {
		resolvedData.status = 'verified'
		resolvedData.reviewed = true

	  }
	},
  },
})
export default utils.addTrackingFields(listConfigurations)
