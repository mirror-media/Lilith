// @ts-ignore no definition file
import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, json, virtual } from '@keystone-6/core/fields'

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
      label: '名稱',
      validation: {
        isRequired: true,
      },
    }),
    objectJson: json({
	  label: '物件 json',
      ui: {
        createView: { fieldMode: 'hidden' },
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
    animationJson: json({
	  label: '動畫 json',
      ui: {
        createView: { fieldMode: 'hidden' },
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
        resolve: async (
          item: Record<string, unknown>,
          args,
          context
        ): Promise<string> => {
          const id = typeof item?.id === 'number' ? item.id.toString() : null
          // Find the QAList item
          //return embedCodeGen.buildEmbeddedCode(
          //  'theatre',
          //  {  },
          //  embedCodeWebpackAssets
          //)
		  return ''
        },
      }),
      ui: {
        views: './lists/views/embed-code',
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
})

export default utils.addTrackingFields(listConfigurations)
