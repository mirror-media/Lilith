import { utils } from '@mirrormedia/lilith-core'
import { graphql, list } from '@keystone-6/core'
import {
  checkbox,
  select,
  relationship,
  text,
  virtual,
} from '@keystone-6/core/fields'
import { STATUS, STATUS_LABEL, DESC_LENGTH } from './constants'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    person: relationship({
      label: '候選人-選舉',
      many: false,
      ref: 'PersonElection.politics',
    }),
    organization: relationship({
      label: '政黨-選舉',
      many: false,
      ref: 'OrganizationsElection.politics',
    }),
    thread_parent: relationship({
      label: 'Thread',
      many: false,
      ref: 'Politic',
    }),
    changeLog: text({
      label: '修改備註',
      ui: {
        displayMode: 'textarea',
      },
    }),
    desc: text({
      label: '政見',
      ui: {
        displayMode: 'textarea',
      },
    }),
    content: text({
      label: '政策補充說明',
      ui: {
        displayMode: 'textarea',
      },
    }),
    current_progress: select({
      defaultValue: 'no-progress',
      options: [
        { label: '還沒開始', value: 'no-progress' },
        { label: '進行中', value: 'in-progress' },
        { label: '卡關中', value: 'in-trouble' },
        { label: '已完成', value: 'complete' },
      ],
      label: '政見進度',
      isIndexed: true,
    }),
    positionChange: relationship({
      label: '立場變化',
      many: true,
      ui: {
        displayMode: 'cards',
        linkToItem: true,
        cardFields: [
          'positionChangeSummary',
          'checkDate',
          'content',
          'isChanged',
          'link',
          'factcheckPartner',
        ],
        inlineCreate: {
          fields: [
            'positionChangeSummary',
            'checkDate',
            'content',
            'isChanged',
            'link',
            'factcheckPartner',
          ],
        },
        inlineEdit: {
          fields: [
            'positionChangeSummary',
            'checkDate',
            'content',
            'isChanged',
            'link',
            'factcheckPartner',
          ],
        },
        inlineConnect: true,
      },
      ref: 'PoliticPositionChange.politic',
    }),
    factCheck: relationship({
      label: '事實查核',
      many: true,
      ui: {
        displayMode: 'cards',
        linkToItem: true,
        cardFields: [
          'factCheckSummary',
          'content',
          'checkResultType',
          'checkResultOther',
          'link',
          'factcheckPartner',
        ],
        inlineCreate: {
          fields: [
            'factCheckSummary',
            'content',
            'checkResultType',
            'checkResultOther',
            'link',
            'factcheckPartner',
          ],
        },
        inlineEdit: {
          fields: [
            'factCheckSummary',
            'content',
            'checkResultType',
            'checkResultOther',
            'link',
            'factcheckPartner',
          ],
        },
        inlineConnect: true,
      },
      ref: 'PoliticFactCheck.politic',
    }),
    expertPoint: relationship({
      label: '專家觀點',
      many: true,
      ref: 'PoliticExpert.politic',
      ui: {
        displayMode: 'cards',
        linkToItem: true,
        cardFields: [
          'content',
          'expert',
          'avatar',
          'title',
          'expertPointSummary',
          'link',
          'contributer',
        ],
        inlineCreate: {
          fields: [
            'content',
            'expert',
            'avatar',
            'title',
            'expertPointSummary',
            'link',
            'contributer',
          ],
        },
        inlineEdit: {
          fields: [
            'content',
            'expert',
            'avatar',
            'title',
            'expertPointSummary',
            'link',
            'contributer',
          ],
        },
        inlineConnect: true,
      },
    }),
    repeat: relationship({
      label: '重複政見',
      many: true,
      ref: 'PoliticRepeat.politic',
      ui: {
        displayMode: 'cards',
        linkToItem: true,
        cardFields: ['content', 'repeatSummary', 'factcheckPartner', 'link'],
        inlineCreate: {
          fields: ['content', 'repeatSummary', 'factcheckPartner', 'link'],
        },
        inlineEdit: {
          fields: ['content', 'repeatSummary', 'factcheckPartner', 'link'],
        },
        inlineConnect: true,
      },
    }),
    controversies: relationship({
      label: '爭議內容',
      many: true,
      ref: 'PoliticControversie.politic',
      ui: {
        displayMode: 'cards',
        linkToItem: true,
        cardFields: ['content', 'link'],
        inlineCreate: { fields: ['content', 'link'] },
        inlineEdit: { fields: ['content', 'link'] },
        inlineConnect: true,
      },
    }),
    response: relationship({
      label: '政見回應',
      many: true,
      ref: 'PoliticResponse.politic',
      ui: {
        displayMode: 'cards',
        linkToItem: true,
        cardFields: [
          'content',
          'responseName',
          'responsePic',
          'responseTitle',
          'link',
        ],
        inlineCreate: {
          fields: [
            'content',
            'responseName',
            'responsePic',
            'responseTitle',
            'link',
          ],
        },
        inlineEdit: {
          fields: [
            'content',
            'responseName',
            'responsePic',
            'responseTitle',
            'link',
          ],
        },
        inlineConnect: true,
      },
    }),
    source: text({
      label: '資料來源',
      ui: {
        displayMode: 'textarea',
      },
    }),
    contributer: text({
      label: '資料提供',
      ui: {
        displayMode: 'textarea',
      },
    }),
    timeline: relationship({
      label: '時間軸',
      many: true,
      ref: 'PoliticTimeline.politic',
    }),
    status: select({
      options: [
        { label: STATUS_LABEL[STATUS.VERIFIED], value: STATUS.VERIFIED },
        { label: STATUS_LABEL[STATUS.NOTVERIFIED], value: STATUS.NOTVERIFIED },
      ],
      defaultValue: STATUS.NOTVERIFIED,
      label: '狀態',
      isIndexed: true,
    }),
    tag: relationship({
      label: '標籤',
      many: false,
      ref: 'Tag',
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
    politicCategory: relationship({
      label: '類別',
      many: false,
      ref: 'PoliticCategory',
    }),
    checked: checkbox({
      defaultValue: false,
      label: '已查核',
    }),
    reviewed: checkbox({
      defaultValue: false,
      label: '檢閱',
    }),
    labelField: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item: Record<string, unknown>) {
          const status =
            String(item.status) === STATUS.VERIFIED
              ? STATUS_LABEL[STATUS.VERIFIED]
              : STATUS_LABEL[STATUS.NOTVERIFIED]

          let desc = String(item.desc)

          if (desc.length > DESC_LENGTH)
            desc = desc.substring(0, DESC_LENGTH) + '...'

          return `(${item.id})-(${status})-${desc}`
        },
      }),
      ui: {
        description: 'This field is for labelling on CMS only.',
        listView: {
          fieldMode: 'hidden',
        },
      },
    }),
    // memberships: { label: "memberships", type: Relationship, many: false, ref: 'Membership' },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    beforeOperation: async ({ operation, resolvedData, context, item }) => {
      /* ... */

      let checked = item?.checked || false
      if (operation === 'create' && context.session?.data?.role === 'admin') {
        resolvedData.status = 'verified'
        resolvedData.reviewed = true
      }
      if (operation === 'create' || operation === 'update') {
        if (resolvedData.thread_parent) {
          const { parent_status } = await context.query.Politic.findOne({
            where: { id: resolvedData.thread_parent.connect.id },
            query: 'checked',
          })
          if (parent_status === true) {
            checked = true
          }
        } else if (
          resolvedData.factCheck ||
          resolvedData.positionChange ||
          resolvedData.repeat ||
          resolvedData.expertPoint
        ) {
          checked = true
        }
      }
      if (operation === 'update') {
        if (item.checked === true && !resolvedData.checked) {
          checked = false
        } else if (!item.checked && resolvedData.checked === true) {
          checked = true
        }
      }

      if (resolvedData) resolvedData.checked = checked
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
