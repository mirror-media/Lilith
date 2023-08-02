// @ts-ignore no definition file
import embedCodeGen from '@readr-media/react-embed-code-generator'
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { checkbox, text, select, json, virtual } from '@keystone-6/core/fields'

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
    displayMode: select({
      label: '播放形式',
      options: [
        { label: '滑動', value: 'scroll' },
        { label: '自動', value: 'video' },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 'scroll',
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    shiftLeft: checkbox({
      label: 'READr 版型（向左移動）',
      defaultValue: false,
    }),
    objectJson: json({
      label: '物件 json',
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
    animationJson: json({
      label: '動畫 json',
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
    mobileWidth: select({
      type: 'integer',
      label: '手機寬度',
      options: [
        { label: '576', value: 576 },
        { label: '768', value: 768 },
        { label: '960', value: 960 },
        { label: '1200', value: 1200 },
      ],
      // We want to make sure new posts start off as a draft when they are created
      defaultValue: 768,
      // fields also have the ability to configure their appearance in the Admin UI
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    mobileObjectJson: json({
      label: '手機物件 json',
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
    mobileAnimationJson: json({
      label: '手機動畫 json',
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
    theatreEditor: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/theatre/theatre-editor/index.html?three-story-point-id=${item.id}`,
            label: 'Theatre 編輯器',
          }
        },
      }),
      ui: {
        // A module path that is resolved from where `keystone start` is run
        views: './lists/views/link-button',
        createView: {
          fieldMode: 'hidden',
        },
      },
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (item: Record<string, unknown>): Promise<string> => {
          const code = embedCodeGen.buildEmbeddedCode(
            'react-theatre',
            {
              animateJson: item?.animationJson ?? {},
              mobileAnimateJson: item?.mobileAnimationJson ?? {},
              objectJson: item?.objectJson ?? [],
              mobileObjectJson: item?.mobileObjectJson ?? [],
              mobileSize: item?.mobileWidth ?? 768,
              type: item?.displayMode ?? 'scroll',
            },
            embedCodeWebpackAssets
          )

          return code.replace(
            /(<div id=.*><\/div>)/,
            `<div class='embedded-code-container'>$1</div>`
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
    preview: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/demo/theatre/${item.id}`,
            label: 'Preview',
          }
        },
      }),
      ui: {
        // A module path that is resolved from where `keystone start` is run
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
})

export default utils.addTrackingFields(listConfigurations)
