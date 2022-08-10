import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, relationship, select,json } from '@keystone-6/core/fields'
const { allowRoles, admin, moderator, editor } = utils.accessControl

enum ColumnType {
  Trend = 'trend',
  Entrepreneur = 'entrepreneur',
  Publication = 'publication',
}


const listConfigurations = list({
  fields: {
    name: text({
      label: '姓名',
      validation: { isRequired: true },
    }),
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
      validation: {
        length: {
          min: 1,
        },
        match: {
          regex: new RegExp('^[a-zA-Z0-9]*$'),
          explanation: '限輸入英文或數字',
        }
      }
    }),
    type: select({
      label: '類別',
      type: 'enum',
      options: [
        { label: '趨勢與觀察', value: ColumnType.Trend },
        { label: '創業家紀實', value: ColumnType.Entrepreneur },
        { label: '社企流出品', value: ColumnType.Publication },
      ],
      ui: {
        displayMode: 'segmented-control',
        listView: {
          fieldMode: 'read',
        },
      },
      validation: { isRequired: true },
    }),
    profile_photo: customFields.relationship({
      label: '作者頭貼',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    intro: customFields.richTextEditor({
        label: '敘述',
      }),
    posts: relationship({
      label: '作者文章post',
      ref: 'Post.columns',
      ui: {
        inlineEdit: { fields: ['slug'] },
        hideCreate: true,
        // linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['slug'] },
      },
      many: true,
    }),
    specialfeatures: relationship({
      label: '作者文章specialfeature',
      ref: 'Specialfeature.columns',
      ui: {
        inlineEdit: { fields: ['slug'] },
        hideCreate: true,
        // linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['slug'] },
      },
      many: true,
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    // isHidden: true,
    listView: {
      initialColumns: ['name', 'slug', 'type'],
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
    const { content } = resolvedData
    if (content) {
      resolvedData.apiData = customFields.draftConverter
        .convertToApiData(content)
        .toJS()
    }}
  },

})

export default listConfigurations
