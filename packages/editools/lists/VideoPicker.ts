// @ts-ignore ecg does not provide definition files
import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { checkbox, text, file, virtual, select } from '@keystone-6/core/fields'
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
    video960: file(),
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
    hintMode: select({
      label: '提示區塊模式',
      type: 'string',
      options: [
        {
          label: '明亮模式',
          value: 'light',
        },
        {
          label: '黑暗模式',
          value: 'dark',
        },
      ],
      defaultValue: 'light',
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const urlPrefix = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}`
          const videoUrls = []
          if (item?.video720_filename) {
            videoUrls.push({
              size: 720,
              videoUrl: `${urlPrefix}/files/${item?.video720_filename}`,
            })
          }
          if (item?.video960_filename) {
            videoUrls.push({
              size: 960,
              videoUrl: `${urlPrefix}/files/${item?.video960_filename}`,
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

          const style = `
            <style>
              .embedded-code-container-top {
                margin-top: -60px;
                margin-left: -20px;
                z-index: 100;
              }
              .embedded-code-container {
                margin-top: -32px;
                margin-left: -20px;
                z-index: 100;
                position: relative;
              }

              @media (min-width:768px) {
                .embedded-code-container-top, .embedded-code-container {
                  margin-left: calc((100vw - 568px)/2 * -1);
                }
              }
              @media (min-width:1200px) {
                .embedded-code-container-top, .embedded-code-container {
                  margin-left: calc((100vw - 600px)/2 * -1);
                }
              }
            </style>
          `

          const code = embedCodeGen.buildEmbeddedCode(
            'react-full-screen-video',
            {
              videoUrls,
              muteHint: item?.muteHint,
              isDarkMode: item?.hintMode === 'dark',
              voiceHint:
                item?.voiceHint ||
                '為確保最佳閱讀體驗，建議您開啟聲音、將載具橫放、於網路良好的環境，以最新版本瀏覽器（Chrome 108.0 / Safari 15.5 / Edge 108.0 以上）觀看本專題',
              voiceButton: item?.voiceButton || '確認',
            },
            embedCodeWebpackAssets
          )

          const className = item?.muteHint
            ? 'embedded-code-container-top'
            : 'embedded-code-container'
          return code.replace(
            /(<div id=.*><\/div>)/,
            `${style}<div class='${className}'>$1</div>`
          )
        },
      }),
    }),
    previewButton: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/demo/video-picker/${item?.id}`,
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
      initialColumns: ['name', 'video1920'],
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
