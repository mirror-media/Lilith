import envVar from '../environment-variables'
import { graphql } from '@graphql-ts/schema'
import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import {
  text,
  file,
  relationship,
  select,
  checkbox,
  timestamp,
  json,
  virtual,
} from '@keystone-6/core/fields'
import { getFileURL } from '../utils/common'
import { State } from '../type'

const { allowRoles, admin, moderator, editor } = utils.accessControl

enum VideoState {
  Draft = State.Draft,
  Published = State.Published,
  Scheduled = State.Scheduled,
}

const listConfigurations = list({
  fields: {
    name: text({
      label: 'name',
      validation: { isRequired: true },
    }),
    isShorts: checkbox({
      label: '是否為短影音',
      defaultValue: false,
    }),
    youtubeUrl: text({
      label: 'Youtube網址',
    }),
    file: file({
      label: '檔案',
      storage: 'videos',
    }),
    videoSrc: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const filename = item?.file_filename
          if (!filename || typeof filename !== 'string') {
            return ''
          }
          return getFileURL(envVar.gcs.bucket, envVar.videos.baseUrl, filename)
        },
      }),
    }),
    content: text({
      label: '敘述',
      ui: {
        displayMode: 'textarea',
      },
    }),
    heroImage: relationship({
      label: '首圖',
      ref: 'Photo',
      ui: {
        hideCreate: true,
      },
    }),
    uploader: text({
      label: '上傳者',
    }),
    uploaderEmail: text({
      label: '上傳者 email',
    }),
    isFeed: checkbox({
      label: '供稿',
    }),
    related_posts: relationship({
      label: '相關文章',
      ref: 'Post.related_videos',
      many: true,
    }),
    manualOrderOfRelatedPosts: json({
      label: '相關文章手動排序結果',
    }),
    videoSection: select({
      label: '短影音分區',
      options: [
        { label: '新聞', value: 'news' },
        { label: '二創', value: 'creativity' },
      ],
      defaultValue: 'news',
      isIndexed: true,
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: VideoState.Draft },
        { label: '已發布', value: VideoState.Published },
        { label: '預約發佈', value: VideoState.Scheduled },
      ],
      defaultValue: VideoState.Draft,
      isIndexed: true,
    }),
    publishedDate: timestamp({
      isIndexed: true,
      label: '發佈日期',
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'isShorts', 'videoSection', 'videoSrc'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, editor),
    },
  },
  hooks: {},
})

export default utils.addManualOrderRelationshipFields(
  [
    {
      fieldName: 'manualOrderOfRelatedPosts',
      targetFieldName: 'related_posts',
      targetListName: 'Post',
      targetListLabelField: 'title',
    },
  ],
  utils.addTrackingFields(listConfigurations)
)
