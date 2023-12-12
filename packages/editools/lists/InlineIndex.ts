import config from '../config'
// eslint-disable-next-line
// @ts-ignore
import { utils } from '@mirrormedia/lilith-core'
import { list, graphql } from '@keystone-6/core'
import { text, virtual, relationship, select } from '@keystone-6/core/fields'

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
      label: '索引名稱',
      validation: { isRequired: true },
    }),
    style: select({
      label: '樣式',
      type: 'string',
      defaultValue: 'default',
      options: [
        {
          // 設計稿：https://www.figma.com/file/RfJHjsr8rBa7iIC7ir41AZ/READr_Website?type=design&node-id=2739-19884&mode=design&t=Amg6cZHfpWqnviGf-0
          label: '預設',
          value: 'default',
        },
        {
          // 設計稿（左邊）：https://www.figma.com/file/Dga9yKPatV5dH2xBYv8Nzs/%E4%BA%BA%E7%89%A9%E7%B5%84%E7%B4%A2%E5%BC%95%E5%A5%97%E4%BB%B6?type=design&node-id=0-1&mode=design&t=hwH1TcL8rpwsfW7n-0
          label: '大圖',
          value: 'larger-image',
        },
      ],
    }),
    themeColor: text({ label: '主色調(色碼）', defaultValue: '#000' }),
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
          const themeColor = item.themeColor || '#000'
          const largeImageStyle = `  
          .toc {
            line-height: 0;
            list-style: none;
            padding: 48px 0;
            border-top: 4px solid transparent;
            border-bottom: 4px solid transparent;
            border-image: linear-gradient(
              to right,
              transparent 40px,
              ${themeColor} 40px,
              ${themeColor} calc(100% - 40px),
              transparent calc(100% - 40px)
            )
            1;
          }
          .toc-item {
            line-height: 0;
          }
          .toc-item + .toc-item {
            margin-top: 20px;
          }
          .toc-item__link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            position: relative;
          }
          .toc-item__img--svg {
            position: absolute;
            top: 0;
            left: 0;
          }
          .toc-item__img {
            width: 100vw;
            aspect-ratio: 66.25%;
            box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.15) inset;
          }
          .toc-item__img::before {
            content: 0;
            top: 0;
            left: 0;
          }
          .toc-item__color {
            flex: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100vw;
          }
          .toc-item__color--item {
            width: 100%;
            height: 0;
            padding-top: 66.25%;
            border: 1px solid #000;
          }
          .toc-item__name {
            font-size: 14px;
            font-style: normal;
            font-weight: 500;
            line-height: 150%;
            color: ${themeColor};
            padding: 12px 12px 0 12px;
          }
          .toc-item__img--svg path {
            fill: ${themeColor};
          }
        
          @media (min-width: 768px) {
            .toc {
              display: flex;
              flex-wrap: wrap;
              padding: 60px 0;
              border-color: ${themeColor};
              border-image: none;
            }
            .toc-item {
              width: calc(50% - 30px);
            }
            .toc-item__color {
              width: 100%;
            }
            .toc-item__img {
              width: 100%;
            }
            .toc-item + .toc-item {
              margin-top: 0;
            }
            .toc-item:nth-child(2n) {
              margin-left: 60px;
            }
            .toc-item:nth-child(n + 3) {
              margin-top: 20px;
            }
          }`
          const defaultStyle = `
          .toc { 
            list-style: none;
            padding: 25px 0;
            border-top: 2px solid ${themeColor};
            border-bottom: 2px solid ${themeColor};
           } 
          .toc-item + .toc-item { 
            margin-top: 16px;
            }
          .toc-item__link { 
            display: flex; 
            align-items: center; 
            text-decoration:none; 
          } 
          .toc-item__img { 
            width: 129px; 
            height: 72px; 
          } 
          .toc-item__color { 
            flex: 0;
            width: 129px; 
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center; 
          } 
          .toc-item__color--item { 
            width: 64px; 
            height: 22px; 
            border: 1px solid #000;
          }
          .toc-item__name { 
            font-weight: 700; 
            font-size: 16px; 
            line-height: 23px; 
            letter-spacing: 0.03em; 
            color: ${themeColor}; 
            margin-left: 16px; 
          } 

          @media (min-width: 768px) { 
            .toc { 
              display: flex; 
              flex-wrap: wrap; 
              border-top: 8px solid ${themeColor};
              border-bottom: 8px solid ${themeColor};
            } 
            .toc-item { 
              width: calc(50% - 20px); 
            } 
            .toc-item + .toc-item { 
              margin-top: 0; 
            } 
            .toc-item:nth-child(2n) { 
              margin-left: 40px; 
            } 
            .toc-item:nth-child(n+3) { 
              margin-top:20px; 
            } 
          }`
          const { index } = indexData
          const svgBeforeImg =
            item.style === 'default'
              ? ''
              : `<svg class='toc-item__img--svg'
          xmlns="http://www.w3.org/2000/svg"
          width="71"
          height="71"
          viewBox="0 0 71 71"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M71 4V3.8147e-06H4L0 0V4V71H4V4L71 4Z"
            fill="#3AC5E4"
          />
        </svg>`
          index
            .sort((a, b) => a.order - b.order)
            .forEach((item) => {
              const urlPrefix = config.images.gcsBaseUrl
              const leftArea = item.imageFile?.url
                ? `${svgBeforeImg}<img src='${urlPrefix}${item.imageFile?.url}' class='toc-item__img' alt='${item.name}'/>`
                : `<div class='toc-item__color'>
                  <div class='toc-item__color--item' style='background: ${item.color};'></div>
                </div>`
              indexItemsCode += `
              <li class='toc-item'>
              <a class='toc-item__link' href='#${item.slug}'>
                  ${leftArea}
                  <span class='toc-item__name'>${item.name}</span>
              </a>
            </li>
          `
            })
          return `<ul class='toc'>${indexItemsCode}</ul><style>${
            item.style === 'default' ? defaultStyle : largeImageStyle
          }</style>`
        },
      }),
      ui: {
        views: './lists/views/embed-code',
        createView: {
          fieldMode: 'hidden',
        },
      },
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
