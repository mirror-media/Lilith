import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, relationship, virtual } from '@keystone-6/core/fields'

const embedCodeWebpackAssets = embedCodeGen.loadWebpackAssets()
const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '名稱',
      validation: {
        isRequired: true,
      },
    }),
    items: relationship({
      ref: 'QAItem',
      many: true,
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
          const id = typeof item?.id === 'number' ? item.id.toString() : null
          // Find the QAList item
          const list = await context.query.QAList.findOne({
            where: { id },
            query: `
              id
              name
              createdAt
              updatedAt
              items {
                id
                title
                content
                sortOrder
                createdAt
                updatedAt
              }
            `,
          })

          const items = list?.items

          items?.sort(
            (i1: { sortOrder: number }, i2: { sortOrder: number }) => {
              return i1?.sortOrder - i2?.sortOrder
            }
          )

          return embedCodeGen.buildEmbeddedCode(
            'react-qa-list',
            { questions: items, title: list?.name },
            embedCodeWebpackAssets
          )
        },
      }),
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
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
