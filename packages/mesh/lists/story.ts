import { request, } from 'graphql-request'
import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  integer,
  checkbox,
  json,
} from '@keystone-6/core/fields';

const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

function getReadrPostQuery(postId: string): string {
  return `
    query Post {
      post(where: {id: ${postId}}) {
        id
        content
      }
    }
  `;
}

interface PostContent{
  id: string;
  content: string;
}
interface PostResponse {
  post?: PostContent;
}

const listConfigurations = list ({
  fields: {
    title: text({ validation: { isRequired: false } }),
    url: text({ 
		validation: { isRequired: true },
		isIndexed: 'unique',
	}),
    summary: text({ 
	  validation: { isRequired: false },
	  ui: { displayMode: 'textarea' },
	}),
    content: text({ 
	  validation: { isRequired: false }, 
	  ui: { displayMode: 'textarea' },
	}),
    trimContent: text({
    validation: {isRequired: false},
    ui: {displayMode: 'textarea'},
  }),
    writer: text({ 
	  validation: { isRequired: false }, 
	}),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
  }),
    trimApiData: json({
      label: "資料庫使用",
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
  }),
	source: relationship({ ref: 'Publisher', many: false }),
	author: relationship({ ref: 'Member', many: false }),
	category: relationship({ ref: 'Category', many: false }),
	pick: relationship({ ref: 'Pick.story', many: true }),
	comment: relationship({ ref: 'Comment.story', many: true }),
	related: relationship({ ref: 'Story', many: true }),
    published_date: timestamp({ validation: { isRequired: false } }),
    og_title: text({ validation: { isRequired: false } }),
    og_image: text({ validation: { isRequired: false } }),
    og_description: text({ validation: { isRequired: false } }),
	full_content: checkbox({
	  defaultValue: false,
	}),
    paywall: checkbox({
      defaultValue: false,
    }),
	origid: text({}),
	full_screen_ad: select({
	  label: '蓋板',
	  datatype: 'enum',
	  options: [ 
		{ label: '手機', value: 'mobile' }, 
		{ label: '桌機', value: 'desktop' },
		{ label: '所有尺寸', value: 'all' },
		{ label: '無', value: 'none' }
	  ],
	  defaultValue: 'none',
	}),
    is_active: checkbox({
      defaultValue: true,
    }),
    tag: relationship({ ref: 'Tag', many: true}),
  },
  ui: {
    listView: {
      initialColumns: ['title', 'url'],
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    resolveInput: async ({operation, resolvedData, context }) => {
      const {source, origid} = resolvedData;
      if (origid && operation === 'create'){
        // Get information about the publisher
        const source_id = source?.connect?.id;
        if(source_id){
          const publisher = await context.query.Publisher.findOne({
            where: {id: source_id},
            query: 'need_apidata apidata_endpoint',
          });
          // Retrieve content from api-endpoint and transform it to apidata
          if (publisher?.need_apidata){
            const gql_endpoint = publisher.apidata_endpoint;
            if (gql_endpoint){
              const gql_query = getReadrPostQuery(origid);
              const response: PostResponse = await request(gql_endpoint, gql_query);
              const post: PostContent | undefined = response?.post;
              if (post){
                const {id, content} = post;
                if (content){
                  resolvedData.apiData = customFields.draftConverter
                  .convertToApiData(content)
                  .toJS();
                  console.log(`update apidata for readr post ${id} successed.`);
                }
              }
            }
          }
        }
      }
      return resolvedData;
    },
  },
})

export default utils.addTrackingFields(listConfigurations)
