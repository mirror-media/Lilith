import config from '../config'
// @ts-ignore: no definition
import embedCodeGen from '@readr-media/react-embed-code-generator'
// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  text,
  select,
  image,
  file,
  json,
  virtual,
} from '@keystone-6/core/fields'

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
    hotspotJson: json({
      label: '熱點 json',
      //ui: {
      //  createView: { fieldMode: 'hidden' },
      //},
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
          const imgSrc =
            (item?.imageLink && `${item.imageLink}`) ||
            (item?.imageFile_id &&
              `${config.images.gcsBaseUrl}/images/${item.imageFile_id}.${item.imageFile_extension}`)

          return embedCodeGen.buildEmbeddedCode(
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
          return {
            href: `/demo/360/${item?.id}`,
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
