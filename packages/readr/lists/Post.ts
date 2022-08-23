import { customFields, utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core';
import { checkbox, integer, relationship, timestamp, text, select, json } from '@keystone-6/core/fields';
	  
const {
  allowRoles,
  admin,
  moderator,
  editor,
  owner,
} = utils.accessControl

const listConfigurations = list ({
  fields: {
	slug: text({
      validation: { isRequired: true}, 
      label: '網址名稱（英文）', 
      isIndexed: 'unique' 
    }),
	sortOrder: integer({
	  label: '排列順序',
	}),
    name: text({
      label: '標題', 
      validation: { isRequired: true} 
    }),
    subtitle: text({
      label: '副標', 
      validation: { isRequired: false} 
    }),
    state: select({
      label: '狀態', 
      options: [ 
        { label: 'draft', value: 'draft' },        { label: 'published', value: 'published' }, 
        { label: 'scheduled', value: 'scheduled' }, 
        { label: 'archived', value: 'archived' }, 
        { label: 'invisible', value: 'invisible' }
      ], 
      defaultValue: 'draft', 
      isIndexed: true 
    }),
    publisheTime: timestamp({
      isIndexed: true, 
      label: '發佈日期',  
    }),
    categories: relationship({
      ref: 'Category', 
      label: '分類', 
      many: true 
    }),
    writers: relationship({
      ref: 'Author.posts', 
      many: true, 
      label: '作者' 
    }),
    photographers: relationship({
      many: true, 
      label: '攝影', 
      ref: 'Author' 
    }),
    cameraOperators: relationship({
      label: '影音', 
      many: true, 
      ref: 'Author' 
    }),
    designers: relationship({
      label: '設計', 
      many: true, 
      ref: 'Author' 
    }),
    engineers: relationship({
      many: true, 
      label: '工程', 
      ref: 'Author' 
    }),
    dataAnalysts: relationship({
      many: true, 
      label: '資料分析', 
      ref: 'Author' 
    }),
    otherByline: text({
      validation: { isRequired: false}, 
      label: '作者（其他）' 
    }),
    heroVideo: relationship({
      label: 'Leading Video',
      ref: 'Video',
    }),
    heroImage: relationship({
       label: '首圖',  
       ref: 'Photo',
    }),
    heroCaption: text({
      label: '首圖圖說', 
      validation: { isRequired: false} 
    }),
    heroImageSize: select({
      label: '首圖尺寸', 
      options: [ 
        { label: 'extend', value: 'extend' }, 
        { label: 'normal', value: 'normal' }, 
        { label: 'small', value: 'small' }
      ], 
      defaultValue: 'normal' 
    }),
    style: select({
      isIndexed: true, 
      defaultValue: 'article', 
      options: [ 
        { label: 'review', value: 'review' }, 
        { label: 'news', value: 'news' }, 
        { label: 'report', value: 'report' }, 
        { label: 'memo', value: 'memo' }, 
        { label: 'dummy', value: 'dummy' }, 
        { label: 'card', value: 'card' }, 
        { label: 'qa', value: 'qa' },
        { label: 'project3', value: 'project3' },
        { label: 'embedded', value: 'embedded' },
        { label: 'scrollablevideo', value: 'scrollablevideo' },
        { label: 'frame', value: 'frame' },
        { label: 'blank', value: 'blank' },
      ], 
      label: '文章樣式',  
    }),
    summary: customFields.richTextEditor({
       label: '重點摘要', 
    }),
    content: customFields.richTextEditor({
       label: '內文', 
    }),
    actionList: customFields.richTextEditor({
       label: '延伸議題', 
    }),
    citation: customFields.richTextEditor({
       label: '引用數據', 
    }),
	readringTime: integer({
	  label: '閱讀時間',
	}),
    projects: relationship({
      label: '專題',  
      ref: 'Project.posts',
    }),
    tags: relationship({
      ref: 'Tag.posts', 
      many: true, 
      label: '標籤' 
    }),
    collabration: relationship({
      ref: 'Collaboration.posts', 
      many: true, 
      label: '作者' 
    }),
    relatedPosts: relationship({
      ref: 'Post', 
      many: true, 
      label: '相關文章',  
    }),
    data: relationship({
      ref: 'DataSet.relatedPosts',
      many: true,
      label: '相關資料',
    }),
    ogTitle: text({
      validation: { isRequired: false}, 
      label: 'FB分享標題' 
    }),
    ogDescription: text({
      label: 'FB分享說明', 
      validation: { isRequired: false} 
    }),
    ogImage: relationship({
      label: 'FB分享縮圖',  
      ref: 'Photo',
    }),
    isFeatured: checkbox({
      label: '置頂', 
      isIndexed: true 
    }),
    project: relationship({
      label: 'checklist',
      ref: 'ProjectChecklist.project',
      many: false,
      ui: {
        displayMode: 'cards',
		linkToItem: true,
        cardFields: [
          'asanaCheck',
          'uiCheck',
          'performanceCheck',
          'ga',
          'gtm',
          'og',
          'module',
          'document',
          'asana',
          'tracking',
          'sourceCode',
          'gaLink',
          'retro',
        ],
        inlineCreate: {
          fields: [
			  'asanaCheck',
			  'uiCheck',
			  'performanceCheck',
			  'ga',
			  'gtm',
			  'og',
			  'module',
			  'document',
			  'asana',
			  'tracking',
			  'sourceCode',
			  'gaLink',
			  'retro',
          ],
        },
        inlineCreate: {
          fields: [
			  'asanaCheck',
			  'uiCheck',
			  'performanceCheck',
			  'ga',
			  'gtm',
			  'og',
			  'module',
			  'document',
			  'asana',
			  'tracking',
			  'sourceCode',
			  'gaLink',
			  'retro',
          ],
        },
      },

    }),
    css: text({
      ui: { displayMode: 'textarea' }, 
      label: 'CSS' 
    }),
    summaryApiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    apiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    actionlistApiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
    citationApiData: json({
      label: '資料庫使用',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    labelField: 'slug',
    listView: {
      initialColumns: ['id', 'slug', 'status'],
      initialSort: { field: 'publishedDate', direction: 'DESC' },
      pageSize: 50,
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
	resolveInput: async ({ resolvedData, context }) => {
      const { summary, content, actionList, citation } = resolvedData                                                                                                                             
      if (content) {
        resolvedData.apiData = customFields.draftConverter
          .convertToApiData(content)
          .toJS()
      }
      if (summary) {
        resolvedData.summaryApiData = customFields.draftConverter
          .convertToApiData(summary)
          .toJS()
      }
      if (actionList) {
        resolvedData.actionlistApiData = customFields.draftConverter
          .convertToApiData(actionList)
          .toJS()
      }
      if (citation) {
        resolvedData.citationApiData = customFields.draftConverter
          .convertToApiData(citation)
          .toJS()
      }
	}
  }
})
export default utils.addTrackingFields(listConfigurations)
