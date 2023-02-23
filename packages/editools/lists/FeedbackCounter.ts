// @ts-ignore: no definition
import embedCodeGen from '@readr-media/react-embed-code-generator'
// @ts-ignore: no definition
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, virtual, relationship, checkbox } from '@keystone-6/core/fields'

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
    form: relationship({
      ref: 'Form',
      ui: {
        displayMode: 'select',
        hideCreate: true,
      },
      many: false,
    }),
    name: text({
      label: '表單代稱',
      validation: { isRequired: true },
    }),
    uri: text({
      label: 'URI (區隔用)',
    }),
    theme: text({
      label: '表單顯示樣式',
    }),
    shouldUseRecaptcha: checkbox({
      label: '是否使用 reCAPTCHA 機制',
      defaultValue: false,
    }),
    thumbUpLabel: text({
      label: '正向回饋標籤文字',
    }),
    thumbDownLabel: text({
      label: '負向回饋標籤文字',
    }),
    embeddedCode: virtual({
      label: 'Embedded Code',
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
          const forms = await context.query.Form.findMany({
            where: {
              id: { equals: formId },
              fields: { every: { type: { equals: 'single' } } },
            },
            query: `
              id
              name
              type
              active
              fieldsCount
              fields {
                id
                name
                type
                status
                sortOrder
              }
            `,
          })

          const form = forms[0]
          if (!form) return 'not a valid form'

          // set configs to form item
          form.fields = form.fields.map((field: Record<string, unknown>) => ({
            ...field,
            thumbUpLabel: item.thumbUpLabel,
            thumbDownLabel: item.thumbDownLabel,
            identifier: item.uri,
          }))

          return embedCodeGen.buildEmbeddedCode(
            'react-feedback',
            {
              forms: [form],
              theme: item.theme,
              shouldUseRecaptcha: item.shouldUseRecaptcha,
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
            href: `/demo/feedback-counter/${item?.id}`,
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
      initialColumns: ['form', 'name', 'uri'],
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
