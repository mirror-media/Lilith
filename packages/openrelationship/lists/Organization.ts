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

const listConfigurations = list ({
  fields: {
    name: text({ label: '組織名稱', 
	  isRequired: true 
	}),
    alternative: text({ label: '組織別名' }),
    other_names: text({ label: '組織舊名' }),
    identifiers: text({ label: '統一編號' }),
    classification: select({
      label: '組織類型',
      options: classificationOptions,
    }),
    abstract: text({ label: '一句話描述該組織' }),
    description: text({ label: '組織詳細介紹', }),
    founding_date_year: integer({ label: '組織成立年' }),
    founding_date_month: integer({ label: '組織成立月' }),
    founding_date_day: integer({ label: '組織成立日' }),

    dissolution_date_year: integer({ label: '組織解散年' }),
    dissolution_date_month: integer({ label: '組織解散月' }),
    dissolution_date_day: integer({ label: '組織解散日' }),

    image: text({ label: '圖像' }),
    contact_details: text({ 
	  label: '聯絡方式',
	  isMultiline: true }),
    links: text({ label: '網站' }),
    address: text({ label: '組織稅籍登記地址' }),
    source: text({ label: '來源' }),
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
