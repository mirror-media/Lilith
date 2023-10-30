import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'

import { text, password, select, checkbox } from '@keystone-6/core/fields'

const { allowRolesForUsers, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '姓名',
      validation: { isRequired: true },
    }),
    email: text({
      label: 'Email',
      validation: { isRequired: true },
      isIndexed: 'unique',
      isFilterable: true,
    }),
    password: password({
      label: '密碼',
      validation: { isRequired: true },
    }),
    role: select({
      label: '角色權限',
      type: 'string',
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'moderator',
          value: 'moderator',
        },
        {
          label: 'editor',
          value: 'editor',
        },
        {
          label: 'contributor',
          value: 'contributor',
        },
      ],
      validation: { isRequired: true },
    }),
    isProtected: checkbox({
      defaultValue: false,
    }),
    // posts: relationship({ ref: 'Post.author', many: true }),
  },

  ui: {
    listView: {
      initialColumns: ['name', 'role'],
    },
  },
  access: {
    operation: {
      query: allowRolesForUsers(admin, moderator, editor),
      update: allowRolesForUsers(admin, moderator, editor),
      create: allowRolesForUsers(admin, moderator),
      delete: allowRolesForUsers(admin),
    },
  },
  hooks: {
	validateInput: async ({
	  listKey,
	  operation,
	  inputData,
	  item,
	  resolvedData,
	  context,
	  addValidationError,
	}) => { /* ... */ 
	  if (operation === 'update') {
		if (context!.session?.data?.name !== item?.name && (context!.session?.data?.role === 'editor')) {
		  addValidationError("沒有修改權限")
		}
	  }
	},
  },
})

export default listConfigurations
