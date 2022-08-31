import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { relationship, select, integer, text } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const genderOptions = [
  { value: 'F', label: '女' },
  { value: 'M', label: '男' },
  { value: 'NA', label: ' ' },
]

const listConfigurations = list ({
  fields: {
    name: text({ 
	  label: '姓名', 
	  isRequired: true 
	}),
    alternative: text({ 
	  label: '別名'
	}),
    other_names: text({ 
	  label: '舊名'
	}),
    email: text({ 
	  label: '電子信箱', 
	}),
    gender: select({
      label: '生理性別',
      options: genderOptions,
      default: 'NA',
    }),
    birth_date_year: integer({ label: '出生年' }),
    birth_date_month: integer({ label: '出生月' }),
    birth_date_day: integer({ label: '出生日' }),
    death_date_year: integer({ label: '死亡年' }),
    death_date_month: integer({ label: '死亡月' }),
    death_date_day: integer({ label: '死亡日' }),
    image: text({ label: '大頭照' }),
    summary: text({ label: '一句話描寫這個人' }),
    biography: text({ label: '詳細生平' }),
    national_identity: text({ label: '國籍' }),
    contact_details: text({ label: '聯絡方式' }),
    links: text({ label: '網站' }),
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
