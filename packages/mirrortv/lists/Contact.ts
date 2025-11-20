import { list } from '@keystone-6/core'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { text, relationship, checkbox, integer } from '@keystone-6/core/fields'
import { v4 as uuidv4 } from 'uuid'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

const listConfigurations = list({
  fields: {
    sortOrder: integer({
      label: '排序順位',
      isIndexed: 'unique',
    }),
    slug: text({
      label: 'Slug',
      isIndexed: 'unique',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === 'create' && !resolvedData.slug) {
            return uuidv4()
          }
          return resolvedData.slug
        },
      },
    }),
    name: text({
      label: '姓名',
      validation: { isRequired: true },
    }),
    email: text({
      label: 'Email',
    }),
    anchorImg: relationship({
      label: '長方形圖',
      ref: 'Image',
    }),
    showhostImg: relationship({
      label: '正方形圖',
      ref: 'Image',
    }),
    homepage: text({ label: '個人首頁' }),
    facebook: text({ label: 'Facebook' }),
    instagram: text({ label: 'Instagram' }),
    twitter: text({ label: 'Twitter / X' }),
    bio: customFields.richTextEditor({
      label: '個人簡介',
      website: 'mirrormedia',
    }),
    anchorperson: checkbox({
      label: '主播',
      defaultValue: false,
    }),
    host: checkbox({
      label: '節目主持人',
      defaultValue: false,
    }),
    international: checkbox({
      label: '鏡國際',
      defaultValue: false,
    }),
    // [TODO] enable these relationships after Show and Serie lists are created
    /*
    relatedShows: relationship({
      label: '關聯藝文節目',
      ref: 'Show.hostName',
      many: true,
    }),
    */
    /*
    relatedSeries: relationship({
      label: '關聯節目單元',
      ref: 'Serie.relatedContacts', 
      many: true,
    }),
    */
    bioApiData: text({
      label: 'bio API Data',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    bioHtml: text({
      label: 'bio HTML',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    isResigned: checkbox({
      label: '已離職',
      defaultValue: false,
    }),
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor, contributor),
      delete: allowRoles(admin, moderator),
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { bio } = resolvedData
      if (bio) {
        try {
          // draftConverter: 把編輯器的 raw data 轉成 JSON (API Data)
          const apiData = customFields.draftConverter.convertToApiData(bio)
          resolvedData.bioApiData = JSON.stringify(apiData.toJS())
        } catch (err) {
          console.error('DraftJS conversion failed:', err)
        }
      }
      return resolvedData
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'sortOrder', 'slug', 'name'],
      initialSort: { field: 'id', direction: 'DESC' },
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
