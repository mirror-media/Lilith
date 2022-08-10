import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { document } from '@keystone-6/fields-document'
import { text, relationship, select } from '@keystone-6/core/fields'
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
    intro: document({
      label: '敘述',
      formatting: {
        inlineMarks: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
        },
        listTypes: {
          ordered: true,
          unordered: true,
        },
        alignment: {
          center: true,
          end: true,
        },
        headingLevels: [1, 2, 3],
        blockTypes: {
          blockquote: true,
          code: true,
        },
        softBreaks: true,
      },
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
  },
  ui: {
    // isHidden: true,
    listView: {
      initialColumns: ['name', 'slug', 'column_type'],
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
  hooks: {},
})

export default listConfigurations
