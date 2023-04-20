// @ts-ignore: no definition
import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import {
  checkbox,
  relationship,
  text,
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

const listConfigurations = list({
  fields: {
    name: text({
      label: 'Dual Slides 名稱',
      validation: { isRequired: true },
    }),
    slides: json({
      label: '文字段落與圖片',
      defaultValue: [
        {
          content: [''],
          imgSrc: '',
        },
      ],
    }),
    shiftLeft: checkbox({
      label: 'READr 版型（向左移動）',
      defaultValue: false,
    }),
    helper: relationship({
      ref: 'ComponentHelp',
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const slides = item?.slides
          const code = embedCodeGen.buildEmbeddedCode(
            'react-dual-slides',
            {
              slides,
            },
            embedCodeWebpackAssets
          )

          const shiftLeft = item?.shiftLeft

          if (shiftLeft) {
            const style = `
            <style>
              .embedded-code-container {
                margin-top: -32px;
                margin-left: -20px;
                z-index: 1000;
                position: relative;
              }

              @media (max-width:767px) {
                .embedded-code-container {
                  width: 100vw;
                }
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
          }

          return code
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
            href: `/demo/dual-slides/${item.id}`,
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
