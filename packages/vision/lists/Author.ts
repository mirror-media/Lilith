import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { document } from '@keystone-6/fields-document'
import { text, checkbox, relationship } from '@keystone-6/core/fields'
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '姓名',
      validation: { isRequired: true },
    }),
    column: text({
      label: '專欄名稱',
      validation: { isRequired: true },
    }),
    email: text({
      label: 'Email',
      validation: { isRequired: true },
      isIndexed: 'unique',
      isFilterable: true,
    }),
    profile_photo: customFields.relationship({
      label: '照片',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    intro: document({
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
    ref_posts: relationship({
      label: '作者文章',
      ref: 'Post.ref_authors',
      ui: {
        inlineEdit: { fields: ['name'] },
        hideCreate: true,
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    listing: checkbox({ label: '專欄作家清單', defaultValue: false }),
    active: checkbox({ label: '啟用', defaultValue: true }),
  },
  ui: {
    isHidden: true,
    listView: {
      initialColumns: ['name', 'email'],
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
