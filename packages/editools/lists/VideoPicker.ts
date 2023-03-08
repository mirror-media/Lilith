import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { checkbox, text, file, virtual } from '@keystone-6/core/fields'
import config from '../config'

const embedCodeWebpackAssets = embedCodeGen.loadWebpackAssets()
const {
  allowRoles,
  admin,
  moderator,
  editor,
  contributor,
} = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: 'Video Picker 名稱',
      validation: { isRequired: true },
    }),
    video1920: file(),
    video1440: file(),
    video1280: file(),
    video920: file(),
    video720: file(),
    muteHint: checkbox({
      label: '是否顯示聲音播放提醒',
      defaultValue: false,
    }),
    voiceHint: text({
      label: '開啟聲音提示文字',
    }),
    voiceButton: text({
      label: '開啟聲音按鍵文字',
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const urlPrefix = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}`
          const videoUrls = []
          console.log(item)
          if (item?.video720_filename) {
            videoUrls.push({
              size: 720,
              videoUrl: `${urlPrefix}/files/${item?.video720_filename}`,
            })
          }
          if (item?.video920_filename) {
            videoUrls.push({
              size: 920,
              videoUrl: `${urlPrefix}/files/${item?.video920_filename}`,
            })
          }
          if (item?.video1280_filename) {
            videoUrls.push({
              size: 1280,
              videoUrl: `${urlPrefix}/files/${item?.video1280_filename}`,
            })
          }
          if (item?.video1440_filename) {
            videoUrls.push({
              size: 1440,
              videoUrl: `${urlPrefix}/files/${item?.video1440_filename}`,
            })
          }
          if (item?.video1920_filename) {
            videoUrls.push({
              size: 1920,
              videoUrl: `${urlPrefix}/files/${item?.video1920_filename}`,
            })
          }

          return embedCodeGen.buildEmbeddedCode(
            'react-full-screen-video',
            {
              videoUrls,
              muteHint: item?.muteHint,
              isDarkMode: false,
            },
            embedCodeWebpackAssets
          )
        },
      }),
    }),
    previewButton: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/demo/videos-picker/${item?.id}`,
            label: 'Preview',
          }
        },
      }),
      ui: {
        views: require.resolve('./views/link-button'),
      },
    }),
  },
  ui: {
    listView: {
      initialSort: { field: 'id', direction: 'DESC' },
      initialColumns: ['name', 'video-1920'],
      pageSize: 50,
    },
    labelField: 'name',
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor, contributor),
      update: allowRoles(admin, moderator, contributor),
      create: allowRoles(admin, moderator, contributor),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
