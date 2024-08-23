import envVar from '../environment-variables'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { graphql } from '@graphql-ts/schema'
import { list } from '@keystone-6/core'
import {
  text,
  relationship,
  file,
  json,
  virtual,
} from '@keystone-6/core/fields'
import { getFileURL } from '../utils/common'

const { admin, allowRoles, moderator } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '標題',
      validation: { isRequired: true },
    }),
    file: file({
      label: '檔案',
      storage: 'files',
    }),
    audioSrc: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>) {
          const filename = item?.file_filename
          if (!filename || typeof filename !== 'string') {
            return ''
          }
          return getFileURL(envVar.gcs.bucket, envVar.files.baseUrl, filename)
        },
      }),
    }),
    urlOriginal: text({
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'read',
        },
        listView: {
          fieldMode: 'read',
        },
      },
    }),
    heroImage: relationship({
      ref: 'Photo',
      label: '首圖',
    }),
    content: customFields.richTextEditor({
      label: '敘述',
      website: 'mirrormedia',
      disabledButtons: [
        'code',
        'header-four',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'code-block',
        'annotation',
        'divider',
        'embed',
        'font-color',
        'image',
        'info-box',
        'slideshow',
        'table',
        'text-align',
        'color-box',
        'background-color',
        'background-image',
        'background-video',
        'related-post',
        'side-index',
        'video',
        'audio',
        'youtube',
      ],
    }),
    tags: relationship({
      label: '標籤',
      ref: 'Tag',
      many: true,
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },

  access: {
    operation: {
      query: () => true,
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'file', 'urlOriginal'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  hooks: {
    resolveInput: async ({ resolvedData }) => {
      const { content } = resolvedData
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      return resolvedData
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
