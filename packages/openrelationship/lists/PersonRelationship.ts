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
    related_person_id: relationship({
      label: '關係者姓名',
      many: false,
      ref: 'Person',
    }),
    // person_id: { label: "姓名", type: Text },
    // related_person_id: { label: "關係者姓名", type: Text },

    relative: text({ label: '關係者如何稱呼該人物' }),

    start_date_year: integer({ label: '關係開始年' }),
    start_date_month: integer({ label: '關係開始月' }),
    start_date_day: integer({ label: '關係開始日' }),

    end_date_year: integer({ label: '關係結束年' }),
    end_date_month: integer({ label: '關係結束月' }),
    end_date_day: integer({ label: '關係結束日' }),
    source: integer({ label: '資料來源' }),
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
