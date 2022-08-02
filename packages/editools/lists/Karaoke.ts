import config from '../config'
// eslint-disable-next-line
// @ts-ignore
import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { checkbox, text, image, file, virtual } from '@keystone-6/core/fields'

const embedCodeWebpackAssets = embedCodeGen.loadWebpackAssets()
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: 'Karaoke 名稱',
      validation: { isRequired: true },
    }),
    quote: text({
      label: '引言',
      validation: { isRequired: true },
      ui: {
        displayMode: 'textarea',
      },
    }),
    audio: file(),
    imageFile: image(),
    muteHint: checkbox({
      label: '是否顯示聲音播放提醒',
      defaultValue: false,
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const urlPrefix = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}`
          const audioSrc = `${urlPrefix}/files/${item?.audio_filename}`
          const imgSrc =
            item?.imageFile_id &&
            `${urlPrefix}/images/${item.imageFile_id}.${item.imageFile_extension}`

          return embedCodeGen.buildEmbeddedCode(
            'react-karaoke',
            {
              audioUrls: [audioSrc],
              textArr:
                typeof item?.quote === 'string' && item.quote.split('\n'),
              imgSrc,
              muteHint: item?.muteHint,
            },
            embedCodeWebpackAssets
          )
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
      initialColumns: ['name', 'quote'],
      pageSize: 50,
    },
    labelField: 'name',
  },

  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
