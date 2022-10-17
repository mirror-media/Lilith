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
			label: '選舉區名稱',
			validation: { isRequired: true },
		}),
		level: select({
			label: '選舉類型(層級)',
			options: [
				{ value: '中央選舉', label: '中央選舉' },
				{ value: '地方選舉', label: '地方選舉' },
			],
			defaultValue: 'local',
		}),
		type: select({
			label: '選舉目的（種類）',
			options: [
				{ value: '總統', label: '總統' },
				{ value: '立法委員', label: '立法委員' },
				{ value: '縣市首長', label: '縣市首長' },
				{ value: '縣市議員', label: '縣市議員' },
				{ value: '鄉鎮市區長', label: '鄉鎮市區長' },
				{ value: '市/區民代表', label: '市/區民代表' },
				{ value: '村里長', label: '村里長' },
				{ value: '省長', label: '省長' },
				{ value: '省議員', label: '省議員' },
				{ value: '國大代表', label: '國大代表' },
				{ value: '立委補選', label: '立委補選' },
			],
		}),
		indigenous: select({
			label: '選區類別',
			options: [
				{ value: 'plainIndigenous', label: '平地原住民' },
				{ value: 'mountainIndigenous', label: '山地原住民' },
				{ value: 'normal', label: '一般選區' },

			],
		}),
		description: text({ label: '敘述' }),
		status: select({
			label: '狀態',
			options: [
				{ value: 'active', label: '有效' },
				{ value: 'deactive', label: '失效' },
			],
			defaultValue: 'active',
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
