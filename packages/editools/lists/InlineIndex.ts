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
        cardFields: ['name', 'slug', 'order', 'imageFile', 'color'],
        inlineCreate: {
          fields: ['name', 'slug', 'order', 'imageFile', 'color'],
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
                order
                imageFile {
                  url
                }
              }
            `,
          })
          let indexItemsCode = ''
          const style = `
          .toc { 
            list-style: none;
            padding: 25px 0;
            border-top: 2px solid #000928;
            border-bottom: 2px solid #000928;
           } 
          .item + .item { 
            margin-top: 16px;
            }
          .item__link { 
            display: flex; 
            align-items: center; 
            text-decoration:none; 
          } 
          .item__img { 
            width: 129px; 
            height: 72px; 
          } 
          .item__color { 
            flex: 0;
            width: 129px; 
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center; 
          } 
          .item__color--item { 
            width: 64px; 
            height: 22px; 
            border: 1px solid #000;
          }
          .item__name { 
            font-weight: 700; 
            font-size: 16px; 
            line-height: 23px; 
            letter-spacing: 0.03em; 
            color: #000928; 
            margin-left: 16px; 
          } 

          @media (min-width: 768px) { 
            .toc { 
              display: flex; 
              flex-wrap: wrap; 
            } 
            .item { 
              width: calc(50% - 20px); 
            } 
            .item + .item { 
              margin-top: 0; 
            } 
            .item:nth-child(2n) { 
              margin-left: 40px; 
            } 
            .item:nth-child(n+3) { 
              margin-top:20px; 
            } 
          }`
          const { index } = indexData
          index
            .sort((a, b) => a.order - b.order)
            .forEach((item) => {
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
          return `<ul class='toc'>${indexItemsCode}</ul><style>${style}</style>`
        },
      }),
    }),
    previewButton: virtual({
      field: graphql.field({
        type: graphql.JSON,
        resolve(item: Record<string, unknown>): Record<string, string> {
          return {
            href: `/demo/inline-indices/${item?.id}`,
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
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {},
})

export default utils.addTrackingFields(listConfigurations)
