import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { checkbox, text, file, virtual } from '@keystone-6/core/fields'

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
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          console.log(item)
          embedCodeWebpackAssets
        },
      }),
    }),
    previewButton: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>): string {
          return `/demo/karaokes/${item?.id}`
        },
      }),
      ui: {
        views: require.resolve('./preview-button'),
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
