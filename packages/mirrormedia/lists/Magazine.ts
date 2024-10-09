import envVar from '../environment-variables'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  select,
  text,
  timestamp,
  relationship,
  file,
  virtual,
} from '@keystone-6/core/fields'
import { getFileURL } from '../utils/common'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: '期數',
      isIndexed: 'unique',
      validation: { isRequired: true },
    }),
    title: text({
      validation: { isRequired: true },
      label: '標題',
    }),
    pdfFile: file({
      label: '雜誌pdf',
      storage: 'files',
    }),
    // change to virtual field for backward compatibility
    urlOriginal: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const filename = item?.pdfFile_filename
          if (!filename || typeof filename !== 'string') {
            return ''
          }
          return getFileURL(envVar.gcs.bucket, envVar.files.baseUrl, filename)
        },
      }),
    }),
    coverPhoto: relationship({
      label: '首圖',
      ref: 'Photo',
      many: false,
    }),
    type: select({
      options: [
        { label: 'weekly', value: 'weekly' },
        { label: 'special', value: 'special' },
      ],
      isIndexed: true,
      defaultValue: 'weekly',
      label: '種類',
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已發布', value: 'published' },
        { label: '預約發佈', value: 'scheduled' },
        { label: '下線', value: 'archived' },
        { label: '前台不可見', value: 'invisible' },
      ],
      defaultValue: 'draft',
      isIndexed: true,
    }),
    publishedDate: timestamp({
      isIndexed: true,
      label: '發佈日期',
    }),
  },
  ui: {
    labelField: 'title',
    listView: {
      initialColumns: ['id', 'title', 'slug', 'urlOriginal'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
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
})
export default utils.addTrackingFields(listConfigurations)
