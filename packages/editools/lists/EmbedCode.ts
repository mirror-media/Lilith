import embedCodeGen from '@readr-media/react-embed-code-generator'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, relationship, virtual } from '@keystone-6/core/fields'

const embedCodeWebpackAssets = embedCodeGen.loadWebpackAssets()
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: 'Embed Code 名稱',
      validation: { isRequired: true },
    }),
    form: relationship({
      ref: 'Form',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: false,
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (
          item: Record<string, unknown>,
          args,
          context
        ): Promise<string> => {
          const formId =
            typeof item?.formId === 'number' ? item.formId.toString() : null
          // Find the Form item
          const form = await context.query.Form.findOne({
            where: { id: formId },
            query: `
              id
              name
              slug
              type
              active
              content
              feedback
              updatedAt
              createdAt
              updateTime
              updateTimeDesc
              heroImage {
                resized {
                  w480 w800 w1200 w1600 w2400 original
                }
              }
              mobileImage  {
                resized {
                  w480 w800 w1200 w1600 w2400 original
                }
              }
              answers {
                id 
                name
                content
                createdAt
                updatedAt
                heroImage {
                  resized {
                    w480 w800 w1200 w1600 w2400 original
                  }
                }
                mobileImage {
                  resized {
                    w480 w800 w1200 w1600 w2400 original
                  }
                }
              } 
              fields {
                id
                name
                type
                status
                content
                sortOrder
                options {
                  id 
                  name
                  sortOrder
                  value
                }
              } 
              fieldsCount
              questions {
                id
                title
                content
                updatedAt
                createdAt
              }
              conditions {
                id
                type 
                order
                condition { 
                  id
                  formField {
                    id 
                  } 
                  compare
                  option { 
                    id 
                    name
                    value
                  }
                }
                answer { 
                  id
                  name
                }
                next {
                  id
                  name
                }
                goOut
              }
            `,
          })
          switch (form['type']) {
            // 'questionniare' is a typo, but we need to handle it as well
            case 'questionniare':
            case 'questionnaire':
              return embedCodeGen.buildEmbeddedCode(
                'react-questionnaire',
                { form },
                embedCodeWebpackAssets
              )
            case 'qa':
              return embedCodeGen.buildEmbeddedCode(
                'react-qa-list',
                { questions: form.questions },
                embedCodeWebpackAssets
              )
            case 'form':
              return embedCodeGen.buildEmbeddedCode(
                'react-feedback',
                { forms: [form] },
                embedCodeWebpackAssets
              )
            default:
              return `Form type ${form.type} is not supported yet`
          }
        },
      }),
    }),
  },
  ui: {
    listView: {
      initialSort: { field: 'id', direction: 'DESC' },
      initialColumns: ['name', 'form'],
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
