import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, select, integer } from '@keystone-6/core/fields'
import { State } from '../type'

const { allowRoles, admin } = utils.accessControl

enum PromoteTopicState {
  Draft = State.Draft,
  Published = State.Published,
  Archived = State.Archived,
}

const listConfigurations = list({
  fields: {
    order: integer({
      label: '排序',
      isIndexed: 'unique',
      validation: {
        min: 1,
        max: 9999,
      },
    }),
    topics: relationship({
      label: '精選專題',
      ref: 'Topic',
      ui: {
        views: './lists/views/sorted-relationship/index',
        labelField: 'name',
      },
    }),
    state: select({
      label: '狀態',
      options: [
        { label: '草稿', value: PromoteTopicState.Draft },
        { label: '已上線', value: PromoteTopicState.Published },
        { label: '已下線', value: PromoteTopicState.Archived },
      ],
      defaultValue: PromoteTopicState.Draft,
      isIndexed: true,
    }),
  },
  ui: {
    labelField: 'id',
    listView: {
      initialColumns: ['id', 'order', 'topics', 'state'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin),
      update: allowRoles(admin),
      create: allowRoles(admin),
      delete: allowRoles(admin),
    },
  },
  hooks: {
    // 只能有三個 topic 是已上線狀態的
    beforeOperation: async ({ operation, resolvedData, item, context }) => {
      const isPushingToPublished =
        (operation === 'create' && resolvedData.state === 'published') ||
        (operation === 'update' &&
          resolvedData.state === 'published' &&
          item?.state !== 'published')

      if (isPushingToPublished) {
        const publishedTopics = await context.query.PromoteTopic.findMany({
          where: { state: { equals: 'published' } },
          orderBy: { updatedAt: 'asc' },
          query: 'id order',
        })

        if (publishedTopics.length >= 3) {
          const oldestTopic = publishedTopics[0]
          await context.db.PromoteTopic.updateOne({
            where: { id: oldestTopic.id },
            data: { state: 'archived' },
          })

          console.log(
            `[Cache-Control] Max published limit reached. Archived oldest topic ID: ${oldestTopic.id}`
          )
        }
      }
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
