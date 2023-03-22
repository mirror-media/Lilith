// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  relationship,
  timestamp,
  text,
  integer,
  select,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      validation: { isRequired: true },
      label: '名稱',
    }),
    sortOrder: integer({
      label: '排序順位',
    }),
    description: text({
      label: '描述',
      ui: { displayMode: 'textarea' },
    }),
    requireTime: integer({
      label: '所需時間',
    }),
    heroVideo: relationship({
      label: 'Leading Video',
      ref: 'Video',
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
    }),
    startTime: timestamp({
      label: '開始時間',
    }),
    endTime: timestamp({
      label: '結束時間',
    }),
    progress: integer({
      label: '完成進度',
    }),
    collabLink: text({
      label: '協作連結',
    }),
    achvLink: text({
      label: '結案成果連結',
    }),
    state: select({
      isIndexed: true,
      defaultValue: 'draft',
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
        { label: 'scheduled', value: 'scheduled' },
        { label: 'archived', value: 'archived' },
      ],
      label: '狀態',
    }),
    posts: relationship({
      ref: 'Post.collabration',
      label: '相關文章',
      many: true,
    }),
    publishTime: timestamp({
      label: '發布時間',
    }),
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
