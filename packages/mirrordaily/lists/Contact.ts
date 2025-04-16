import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, select, text } from '@keystone-6/core/fields'
import { ContactRole } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      isIndexed: true,
      label: '作者姓名',
      validation: { isRequired: true },
    }),
    role: select({
      label: '角色 (項目與 Post 的欄位名稱對齊)',
      type: 'enum',
      defaultValue: ContactRole.Writer,
      options: [
        {
          label: '作者',
          value: ContactRole.Writer,
        },
        {
          label: '攝影',
          value: ContactRole.Photographer,
        },
        {
          label: '影音',
          value: ContactRole.CameraMan,
        },
        {
          label: '編輯',
          value: ContactRole.Designer,
        },
        // {
        //   label: '工程',
        //   value: ContactRole.Engineer,
        // },
        // {
        //   label: '主播',
        //   value: ContactRole.Vocal,
        // },
      ],
    }),
    content: text({
      label: '敘述',
      ui: { displayMode: 'textarea' },
    }),
    sections: relationship({
      label: '大分類',
      ref: 'Section',
      many: true,
      ui: {
        labelField: 'name',
      },
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'role', 'sections', 'createdAt'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
