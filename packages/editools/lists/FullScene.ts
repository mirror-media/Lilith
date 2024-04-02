import config from '../config'
// @ts-ignore: no definition
import embedCodeGen from '@readr-media/react-embed-code-generator'
// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, select, image, json, virtual } from '@keystone-6/core/fields'

const embedCodeWebpackAssets = embedCodeGen.loadWebpackAssets()
const { allowRoles, admin, moderator, editor, contributor } =
  utils.accessControl

type Session = {
  data: {
    id: string
    role: string
  }
}

function imageFileACL({ session }: { session: Session }) {
  const fieldMode = session?.data?.role == 'contributor' ? 'hidden' : 'edit'
  return fieldMode
}

const listConfigurations = list({
  fields: {
    name: text({
      label: '全景 viewer 名稱',
      validation: { isRequired: true },
    }),
    desc: text({
      label: '圖說',
      validation: { isRequired: true },
      ui: {
        displayMode: 'textarea',
      },
    }),
    //external users can't upload files to our GCS. They can only use the image from their sources.
    imageFile: image({
      storage: 'images',
      ui: {
        createView: { fieldMode: imageFileACL },
        itemView: { fieldMode: imageFileACL },
      },
    }),
    displayMode: select({
      label: '顯示模式',
      options: [
        { label: 'full', value: 'full' },
        { label: 'container', value: 'container' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'container',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    fullSceneConfig: json({
      label: '360 config',
      defaultValue: {
        hotspots: [],
        pitch: 0,
        yaw: 0,
        showControls: true,
      },
      access: {
        operation: {
          query: allowRoles(admin, moderator, editor, contributor),
          update: allowRoles(admin),
          create: allowRoles(admin),
          delete: allowRoles(admin),
        },
      },
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const { imageFile_id, desc, fullSceneConfig, displayMode } = item

          const imageRwdUrls = {
            pc: imageFile_id
              ? `${config.images.gcsBaseUrl}/images/${imageFile_id}.webP`
              : '',
            mb: imageFile_id
              ? `${config.images.gcsBaseUrl}/images/${imageFile_id}-w2400.webP`
              : '',
          }

          return embedCodeGen.buildEmbeddedCode(
            'react-360',
            {
              imageRwdUrls,
              config: fullSceneConfig,
              isFullScreenWidth: displayMode === 'full',
              caption: desc,
            },
            embedCodeWebpackAssets
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
    previewButton: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          const { imageFile_id, imageFile_extension } = item

          const imageUrl = imageFile_id
            ? `${config.images.gcsBaseUrl}/images/${imageFile_id}.${imageFile_extension}`
            : ''

          return {
            imageUrl,
          }
        },
      }),
      ui: {
        views: './lists/views/edit-360-hotspot',
        createView: {
          fieldMode: 'hidden',
        },
      },
    }),
  },
  ui: {
    listView: {
      initialSort: { field: 'id', direction: 'DESC' },
      initialColumns: ['name', 'imageFile'],
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
