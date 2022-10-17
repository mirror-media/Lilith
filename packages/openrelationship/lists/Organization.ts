import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { select, integer, relationship, text } from '@keystone-6/core/fields';

const {
	allowRoles,
	admin,
	moderator,
	editor,
	owner,
} = utils.accessControl

const classificationOptions = [
	{ value: 'company', label: '公司企業' },
	{ value: 'party', label: '政黨' },
	{ value: 'gov', label: '政府' },
	{ value: 'ngo', label: '非政府組織' },
	{ value: 'npo', label: '非營利組織' },
	{ value: 'community', label: '社會團體' },
	{ value: 'other', label: '其他' },
]

const listConfigurations = list({
	fields: {
		name: text({
			label: '組織名稱',
			validation: { isRequired: true }
		}),
		alternative: text({
			label: '組織別名',
			db: {
				isNullable: true,
			},
		}),
		other_names: text({
			label: '組織舊名',
			db: {
				isNullable: true,
			},
		}),
		identifiers: text({
			label: '統一編號',
			db: {
				isNullable: true,
			},
		}),
		classification: select({
			label: '組織類型',
			options: classificationOptions,
		}),
		abstract: text({
			label: '一句話描述該組織',
			db: {
				isNullable: true,
			},
		}),
		description: text({
			label: '組織詳細介紹',
			db: {
				isNullable: true,
			},
		}),
		founding_date_year: integer({
			label: '組織成立年',
			db: {
				isNullable: true,
			},
		}),
		founding_date_month: integer({
			label: '組織成立月',
			db: {
				isNullable: true,
			},
		}),
		founding_date_day: integer({
			label: '組織成立日',
			db: {
				isNullable: true,
			},
		}),

		dissolution_date_year: integer({
			label: '組織解散年',
			db: {
				isNullable: true,
			},
		}),
		dissolution_date_month: integer({
			label: '組織解散月',
			db: {
				isNullable: true,
			},
		}),
		dissolution_date_day: integer({
			label: '組織解散日',
			db: {
				isNullable: true,
			},
		}),

		image: text({
			label: '圖像',
			db: {
				isNullable: true,
			},
		}),
		contact_details: text({
			label: '聯絡方式',
			db: {
				isNullable: true,
			},
			ui: {
				displayMode: 'textarea'
			}

		}),
		links: text({
			label: '網站',
			db: {
				isNullable: true,
			},
		}),
		address: text({
			label: '組織稅籍登記地址',
			db: {
				isNullable: true,
			},
		}),
		source: text({
			label: '來源',
			db: {
				isNullable: true,
			},
		}),
		status: select({
			options: [
				{ label: '已確認', value: 'verified' },
				{ label: '未確認', value: 'notverified' },
			],
			label: '狀態',
		}),
        tags: relationship({
          label: '標籤',
          many: true,
          ref: 'Tag',
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
