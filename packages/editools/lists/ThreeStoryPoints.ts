import config from '../config'
// @ts-ignore: no definition
import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { checkbox, text, file, json, virtual } from '@keystone-6/core/fields'

const embedCodeWebpackAssets = embedCodeGen.loadWebpackAssets()
const {
  allowRoles,
  admin,
  moderator,
  editor,
  contributor,
} = utils.accessControl

type CameraRigData = {
  pois?: {
    position: number[]
    quaternion: number[]
    ease: string
    duration: number
  }
}

const listConfigurations = list({
  fields: {
    name: text({
      label: 'Three Story Points 名稱',
      validation: { isRequired: true },
    }),
    model: file({
      label: '上傳 model glb 檔案',
    }),
    desktopModel: file({
      label: '上傳 model 桌機版 glb 檔案',
    }),
    lightModel: file({
      label: '上傳 light（燈光）glb 檔案',
    }),
    captions: json({
      label: '鏡頭移動分鏡說明',
      defaultValue: [],
    }),
    audios: json({
      label: '鏡頭分鏡搭配的聲音導覽',
      defaultValue: [
        {
          urls: [],
          preload: 'auto',
        },
      ],
    }),
    cameraRig: json({
      label: '鏡頭移動軌跡',
      defaultValue: { pois: [] },
    }),
    debugMode: checkbox({
      label: 'debug 模式',
      defaultValue: false,
    }),
    camerHelper: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/three/camera-helper/index.html?three-story-point-id=${item.id}`,
            label: '建立鏡頭移動軌跡（Camera Helper）',
          }
        },
      }),
      ui: {
        views: require.resolve('./views/link-button'),
      },
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const cameraRig: CameraRigData = item?.cameraRig as CameraRigData
          const urlPrefix = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}`
          const mobileModel = {
            url: `${urlPrefix}/files/${item?.model_filename}`,
            fileFormat: 'glb',
          }

          let desktopModel
          if (item?.desktopModel_filename) {
            desktopModel = {
              url: `${urlPrefix}/files/${item?.desktopModel_filename}`,
              fileFormat: 'glb',
            }
          }

          let lightModel
          if (item?.lightModel_filename) {
            lightModel = {
              url: `${urlPrefix}/files/${item?.lightModel_filename}`,
              fileFormat: 'glb',
            }
          }

          const code = embedCodeGen.buildEmbeddedCode(
            'react-three-story-points',
            {
              models: lightModel ? [mobileModel, lightModel] : [mobileModel],
              desktopModels: lightModel
                ? [desktopModel, lightModel]
                : [desktopModel],
              pois: cameraRig?.pois || [],
              audios: item?.audios,
              captions: item?.captions,
              debugMode: item?.debugMode,
            },
            embedCodeWebpackAssets
          )

          const style = `
            <style>
              .embedded-code-container {
                margin-top: -32px;
                margin-left: -20px;
                z-index: 100;
                position: relative;
              }
              @media (min-width:768px) {
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

          return code.replace(
            /(<div id=.*><\/div>)/,
            `${style}<div class='embedded-code-container'>$1</div>`
          )
        },
      }),
    }),
    preview: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/demo/three-story-points/${item.id}`,
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
