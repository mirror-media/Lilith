// @ts-ignore: no definition
//import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  checkbox,
  relationship,
  text,
  json,
  virtual,
  image,
} from '@keystone-6/core/fields'
// @ts-ignore no definitino file
import embedCodeGen from '@readr-media/react-embed-code-generator'
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
      label: 'Random text selector名稱',
      validation: { isRequired: true },
    }),
    json: json({
      label: '內容（JSON）',
      defaultValue: ['001.json'],
    }),
    shiftLeft: checkbox({
      label: 'READr 版型（向左移動）',
      defaultValue: false,
    }),
    helper: relationship({
      ref: 'ComponentHelp',
    }),
    highlightDesktop: image({
      storage: 'images',
      label: '段落醒目樣式（桌機版）',
    }),
    highlightMobile: image({
      storage: 'images',
      label: '段落醒目樣式（手機版）',
    }),
    loadingIcon: image({
      storage: 'images',
      label: 'Loading Icon',
    }),
    button: image({
      storage: 'images',
      label: '按鈕樣式',
    }),
    buttonLabel: text({
      label: '按鈕文字',
      validation: { isRequired: true },
    }),
    backgroundColor: text({
      label: '背景顏色',
      defaultValue: '#000',
    }),
    isDebugMode: checkbox({
      label: 'Debug Mode',
      defaultValue: false,
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const urlPrefix = config.images.gcsBaseUrl

          let style = ''

          if (item?.shiftLeft) {
            style = `
            <style>
              .embedded-code-container {
                margin-left: -20px;
                position: relative;
                z-index: 800;
              }
              @media (min-width:608px) {
                .embedded-code-container {
                  margin-left: calc((100vw - 568px)/2 * -1);
                }
              }
              @media (min-width:1200px) {
                .embedded-code-container {
                  margin-left: calc((100vw - 600px)/2 * -1);
                }
              }
            </style>
          `
          }

          const code = embedCodeGen.buildEmbeddedCode(
            'react-random-text-selector',
            {
              jsonUrls: item?.json ?? [],
              backgroundColor: item?.backgroundColor ?? '#000000',
              circleUrl: item.imageFile_id
                ? `${urlPrefix}/images/${item.imageFile_id}.${item.highlightDesktop_extension}`
                : undefined,
              circleUrlMobile: item.highlightMobile_id
                ? `${urlPrefix}/images/${item.highlightMobile_id}.${item.highlightMobile_extension}`
                : undefined,
              buttonBackground: item.button_id
                ? `${urlPrefix}/images/${item.button_id}.${item.button_extension}`
                : undefined,
              buttonWording: item?.buttonLabel ?? '其他案例',
              isDebugMode: item?.isDebugMode,
              loadingImgSrc: item.loadingIcon_id
                ? `${urlPrefix}/images/${item.loadingIcon_id}.${item.loadingIcon_extension}`
                : undefined,
            },
            embedCodeWebpackAssets
          )

          return code.replace(
            /(<div id=.*><\/div>)/,
            `${style}<div class='embedded-code-container'>$1</div>`
          )
        },
      }),
      ui: {
        views: './lists/views/embed-code',
        createView: {
          fieldMode: 'hidden',
        },
      },
    }),
    preview: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/demo/text-selector/${item.id}`,
            label: 'Preview',
          }
        },
      }),
      ui: {
        views: './lists/views/link-button',
        createView: {
          fieldMode: 'hidden',
        },
      },
    }),
  },
  ui: {
    listView: {
      initialSort: { field: 'id', direction: 'DESC' },
      initialColumns: ['name'],
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
