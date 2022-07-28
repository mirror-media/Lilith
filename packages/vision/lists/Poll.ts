import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { text, select, relationship, timestamp } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  // ui: {
  //     isHidden: true,
  // },
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
      isIndexed: 'unique',
    }),
    image: customFields.relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
      customConfig: {
        isImage: true,
      },
    }),
    choice: select({
      label: '選項',
      options: [
        { label: '單選', value: 'single' },
        { label: '複選', value: 'multiple' },
      ],
    }),
    type: select({
      label: '結果樣式',
      options: [
        { label: '圓餅', value: 'pie' },
        { label: '長條圖', value: 'bar' },
        { label: '百分比', value: 'percentage' },
      ],
    }),
    status: select({
      options: [
        { label: '上架', value: 'published' },
        { label: '草稿', value: 'draft' },
        { label: '下架', value: 'archived' },
      ],
      defaultValue: 'draft',
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    startTime: timestamp({
      label: '開始時間',
    }),
    endTime: timestamp({
      label: '結束時間',
    }),
    publishTime: timestamp({
      label: '發布時間',
    }),
    options: relationship({
      ref: 'PollOption.poll',
      ui: {
        hideCreate: true,
        displayMode: 'select',
        cardFields: ['name'],
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    ref_posts: relationship({
      label: '相關文章',
      ref: 'Post.ref_polls',
      ui: {
        hideCreate: true,
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    }),
    result: relationship({
      ref: 'PollResult.poll',
      ui: {
        hideCreate: true,
      },
      many: true,
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
