import config from '../config'
// eslint-disable-next-line
// @ts-ignore
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, virtual, relationship } from '@keystone-6/core/fields'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    name: text({
      label: '索引名稱',
      validation: { isRequired: true },
    }),
    index: relationship({
      label: '索引',
      ref: 'IndexItem.index',
      many: true,
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'slug', 'imageFile', 'color'],
        inlineCreate: {
          fields: ['name', 'slug', 'imageFile', 'color'],
        },
      },
    }),
    embedCode: virtual({
      label: 'embed code',
      field: graphql.field({
        type: graphql.String,
        resolve: async (
          item: Record<string, unknown>,
          arg,
          context
        ): Promise<string> => {
          const indexData = await context.query.InlineIndex.findOne({
            where: { id: item.id },
            query: `
              id
              index {
                id
                slug
                name
                color
                imageFile {
                  url
                }
              }
            `,
          })
          let indexItemsCode = ''
          indexData?.index?.forEach((item) => {
            const urlPrefix = `${config.googleCloudStorage.origin}/${config.googleCloudStorage.bucket}`
            const leftArea = item.imageFile?.url
              ? `<img src='${urlPrefix}${item.imageFile?.url}' class='item__img' alt='${item.name}'/>`
              : `<div class='item__color'>
                  <div class='item__color--item' style='background: ${item.color};'></div>
                </div>`
            indexItemsCode += `
            <li class='item'>
              <a class='item__link' href='#${item.slug}'>
                  ${leftArea}
                  <span class='item__name'>${item.name}</span>
              </a>
            </li>
          `
          })
          return `<ul class='toc'>${indexItemsCode}</ul><style>${item.style}</style>`
        },
      }),
    }),
    style: text({
      label: 'Style',
      ui: {
        displayMode: 'textarea',
      },
    }),
    previewButton: virtual({
      field: graphql.field({
        type: graphql.String,
        resolve(item: Record<string, unknown>): string {
          return `/demo/inline-indices/${item?.id}`
        },
      }),
      ui: {
        views: require.resolve('./preview-button'),
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
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
