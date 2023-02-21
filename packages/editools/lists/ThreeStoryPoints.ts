import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, file, json, virtual } from '@keystone-6/core/fields'

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
      label: 'Three Story Points 名稱',
      validation: { isRequired: true },
    }),
    model: file({
      label: 'glb 檔案',
    }),
    captions: json({
      label: '鏡頭移動分鏡說明',
      defaultValue: [],
    }),
    cameraRig: json({
      label: '鏡頭移動軌跡',
      defaultValue: [],
    }),
    camerHelper: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>): string {
          return `/files/${item.model_filename}`
        },
      }),
      ui: {
        views: require.resolve('./three-camera-helper'),
      },
    }),
    preview: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>): string {
          return `${item.id}`
        },
      }),
      ui: {
        views: require.resolve('./three-story-points'),
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
