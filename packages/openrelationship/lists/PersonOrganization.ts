import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { relationship, text, integer } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    person_id: relationship({
      label: '姓名',
      many: false,
      ref: 'Person',
    }),
    organization_id: relationship({
      label: '組織名稱',
      many: false,
      ref: 'Organization',
    }),
    role: text({ label: '職位名稱' }),
    start_date_year: integer({ label: '開始年' }),
    start_date_month: integer({ label: '開始月' }),
    start_date_day: integer({ label: '開始日' }),

    end_date_year: integer({ label: '結束年' }),
    end_date_month: integer({ label: '結束月' }),
    end_date_day: integer({ label: '結束日' }),
    source: text({ label: '資料來源' }),

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
