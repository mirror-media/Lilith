import { list } from '@keystone-6/core'
import { utils } from '@mirrormedia/lilith-core'
import {
  text,
  relationship,
  select,
  checkbox,
  file,
  json,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    file: file({
      label: '檔案',
      storage: 'images',
    }),
    copyright: select({
      label: '版權',
      options: [
        { label: 'Creative-Commons', value: 'Creative-Commons' },
        { label: 'Copyrighted', value: 'Copyrighted' },
      ],
      defaultValue: 'Copyrighted',
    }),
    // [TODO] enable when Topic list is ready
    // topic: relationship({
    //   label: '專題',
    //   ref: 'Topic',
    // }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
    }),
    needWatermark: checkbox({
      label: 'Need watermark?',
    }),
    keywords: text({ label: '關鍵字' }),
    meta: text({ label: '中繼資料' }),

    // URL 相關欄位 (唯讀)
    urlOriginal: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlDesktopSized: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlTabletSized: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlMobileSized: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    urlTinySized: text({
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),

    imageApiData: json({
      label: 'Image API Data (JSON)',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
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
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'copyright'],
      initialSort: { field: 'id', direction: 'DESC' },
    },
  },
  // [TODO] Hooks for Image Processing
  // hooks: {
  //    afterOperation: ...
  // },
})

export default utils.addTrackingFields(listConfigurations)
