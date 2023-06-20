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
      label: 'Dropping Text 名稱',
      validation: { isRequired: true },
    }),
    textArr: json({
      label: '文字(JSON)',
      defaultValue: ['這是', 'Dropping Text', '套件'],
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
          const shiftLeft = item?.shiftLeft

          const code = embedCodeGen.buildEmbeddedCode(
            'react-dropping-text',
            {
              textArr: item?.textArr,
            },
            embedCodeWebpackAssets
          )

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
            href: `/demo/dropping-text/${item.id}`,
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
