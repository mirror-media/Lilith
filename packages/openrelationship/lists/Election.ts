import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { relationship, integer, select, text } from '@keystone-6/core/fields';

const {
	allowRoles,
	admin,
	moderator,
	editor,
	owner,
} = utils.accessControl

const listConfigurations = list({
	fields: {
		name: text({
			label: '名稱',
			validation: { isRequired: true }
		}),
		description: text({ label: '敘述' }),
		election_year_year: integer({ label: '選舉年' }),
		election_year_month: integer({ label: '選舉月' }),
		election_year_day: integer({ label: '選舉日' }),
		level: select({
			label: '選舉類型(層級)',
			options: [
				{ value: 'central', label: '中央選舉' },
				{ value: 'local', label: '地方選舉' },
			],
			defaultValue: 'local',
		}),
		type: select({
			label: '選舉目的（種類）',
			options: [
				{ value: 'president', label: '總統' },
				{ value: 'legislator', label: '立法委員' },
				{ value: 'mayor', label: '縣市首長' },
				{ value: 'CouncilMember', label: '縣市議員' },
				{ value: 'townMayor', label: '鄉鎮市區長' },
				{ value: 'townCouncilMember', label: '市/區民代表' },
				{ value: 'villageRepresentative', label: '村里長' },
				{ value: 'governorProvince', label: '省長' },
				{ value: 'provinceCouncilMember', label: '省議員' },
				{ value: 'nationalAssembly', label: '國大代表' },
			],
		}),
		register_date: text({ label: '登記日期' }),
		location: text({ label: '位置' }),
		status: select({
			label: '狀態',
			options: [
				{ value: 'active', label: '有效' },
				{ value: 'deactive', label: '失效' },
			],
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
})
export default utils.addTrackingFields(listConfigurations)
