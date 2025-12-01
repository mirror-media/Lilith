import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  select,
  timestamp,
  checkbox,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: { isRequired: true },
    }),

    state: select({
      label: '狀態',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),

    publishTime: timestamp({
      label: '發佈時間',
      isIndexed: true,
    }),

    categories: relationship({
      label: '分類',
      ref: 'Category',
      many: true,
    }),

    eventType: select({
      label: '活動類型',
      options: [
        { label: 'Embedded', value: 'embedded' },
        { label: 'Video', value: 'video' },
        { label: 'Image', value: 'image' },
        { label: 'Logo', value: 'logo' },
        { label: 'Mod', value: 'mod' },
      ],
      isIndexed: true,
    }),

    startTime: timestamp({
      label: '開始時間',
    }),

    endTime: timestamp({
      label: '結束時間',
    }),

    video: relationship({
      label: '影片',
      ref: 'Video',
    }),

    image: relationship({
      label: '圖片',
      ref: 'Image',
    }),

    embedCode: text({
      label: 'Embed Code',
      ui: { displayMode: 'textarea' },
    }),

    link: text({
      label: '連結',
    }),

    isFeatured: checkbox({
      label: '置頂',
      defaultValue: false,
    }),
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },

  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['name', 'eventType', 'state', 'startTime', 'endTime'],
      initialSort: { field: 'startTime', direction: 'DESC' },
      pageSize: 50,
    },
  },

  graphql: {
    plural: 'Events',
    cacheHint: { maxAge: 3600, scope: 'PUBLIC' },
  },
})

export default utils.addTrackingFields(listConfigurations)
