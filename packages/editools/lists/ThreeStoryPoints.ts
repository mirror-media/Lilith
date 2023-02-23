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
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/three/camera-helper/index.html?three-story-point-id=${item.id}`,
            label: '建立鏡頭移動軌跡（Camera Helper）',
          }
        },
      }),
      ui: {
        views: require.resolve('./views/link-button'),
      },
    }),
    preview: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/three/story-points/preview.html?id=${item.id}`,
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
