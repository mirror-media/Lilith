import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { integer, relationship, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
    organization_id: relationship({
      label: '組織名稱',
      many: false,
      ref: 'Organization',
    }),
    related_organization_id: relationship({
      label: '關係組織名稱',
      many: false,
      ref: 'Organization',
    }),
    relative: text({ label: '組織與關係組織的關係' }),
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
