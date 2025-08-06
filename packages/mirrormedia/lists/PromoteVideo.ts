import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  select,
  integer,
  text,
  checkbox,
  timestamp,
} from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    order: integer({
      label: '排序',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    videoLink: text({
      label: '影片連結',
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已發布', value: 'published' },
        { label: '預約發佈', value: 'scheduled' },
        { label: '下線', value: 'archived' },
      ],
      defaultValue: 'published',
      isIndexed: true,
    }),
    publishedDate: timestamp({
      isIndexed: true,
      label: '發佈日期',
    }),
    isFixed: checkbox({
      label: '固定不替換',
      defaultValue: false,
    }),
  },
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['id', 'order', 'videoLink'],
      initialSort: { field: 'order', direction: 'ASC' },
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
  hooks: {
    afterOperation: async ({ operation, item, context, resolvedData }) => {
      const result = fetch(
        envVar.dataServiceApi + '/gql_to_json?bucket=' + envVar.gcs.bucket + '&dest_file=files/json/promoting-video.json&gql_string=query { promoteVideos( where: { state: { equals: "published" } OR: [ { videoLink: { contains: "youtube.com" } } { videoLink: { contains: "youtu.be" } } ] } take: 6 orderBy: [{ order: asc }]) { id videoLink } }',
        {
          method: 'GET',
        }
      )
        console.log(result)
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
