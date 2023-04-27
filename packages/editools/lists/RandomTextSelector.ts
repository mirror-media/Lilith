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
      validation: { isRequired: true },
      defaultValue: ['001.json'],
      ui: {
        displayMode: 'textarea',
      },
    }),
    shiftLeft: checkbox({
      label: 'READr 版型（向左移動）',
      defaultValue: false,
    }),
    helper: relationship({
      ref: 'ComponentHelp',
    }),
    highlightDesktop: image({
      label: '段落醒目樣式（桌機版）',
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor),
          update: allowRoles(admin, moderator),
          create: allowRoles(admin, moderator),
          delete: allowRoles(admin),
        },
      },
      validation: { isRequired: true },
    }),
    highlightMobile: image({
      label: '段落醒目樣式（手機版）',
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor),
          update: allowRoles(admin, moderator),
          create: allowRoles(admin, moderator),
          delete: allowRoles(admin),
        },
      },
      validation: { isRequired: true },
    }),
    button: image({
      label: '按鈕樣式',
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor),
          update: allowRoles(admin, moderator),
          create: allowRoles(admin, moderator),
          delete: allowRoles(admin),
        },
      },
      validation: { isRequired: true },
    }),
    buttonLabel: text({
      label: '按鈕文字',
      validation: { isRequired: true },
    }),
    backgroundColor: text({
      label: '背景顏色',
      defaultValue: '#000',
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const urlPrefix = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}`

          const style = `
            <style>
              .embedded-code-container-top {
                margin-top: -60px;
                z-index: 100;
              }
              .embedded-code-container {
                margin-top: -32px;
                z-index: 100;
                position: relative;
              }
            </style>
          `

          const code = embedCodeGen.buildEmbeddedCode(
            'text-selector',
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
              shouldShiftLeft: item?.shiftLeft,
            },
            embedCodeWebpackAssets
          )

          return code.replace(
            /(<div id=.*><\/div>)/,
            `${style}<div class='.embedded-code-container'>$1</div>`
          )
        },
      }),
      ui: {
        views: require.resolve('./views/embed-code'),
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
            href: `/demo/text-selector/${item.id}?isDebugMode=true`,
            label: 'Preview',
          }
        },
      }),
      ui: {
        views: require.resolve('./views/link-button'),
        createView: {
          fieldMode: 'hidden',
        },
      },
    }),
    helper: relationship({
      ref: 'ComponentHelp',
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
