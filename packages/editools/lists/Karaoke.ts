import config from '../config'
// @ts-ignore: no definition
import embedCodeGen from '@readr-media/react-embed-code-generator'
// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { checkbox, text, image, file, virtual } from '@keystone-6/core/fields'

const embedCodeWebpackAssets = embedCodeGen.loadWebpackAssets()
const {
  allowRoles,
  admin,
  moderator,
  editor,
  contributor,
} = utils.accessControl

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
    //external users can't upload files to our GCS. They can only use the image from their sources.
    imageFile: image({
      ui: {
        createView: { fieldMode: imageFileACL },
        itemView: { fieldMode: imageFileACL },
      },
    }),
    imageLink: text(),
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
            (item?.imageLink && `${item.imageLink}`) ||
            (item?.imageFile_id &&
              `${urlPrefix}/images/${item.imageFile_id}.${item.imageFile_extension}`)

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
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/demo/karaokes/${item?.id}`,
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
      initialColumns: ['name', 'quote'],
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
