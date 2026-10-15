import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, text } from '@keystone-6/core/fields'
import envVar from '../environment-variables'

const { allowRoles, admin, moderator, editor } = utils.accessControl

const listConfigurations = list({
  fields: {
    slug: text({
      label: 'slug',
      isIndexed: 'unique',
    }),
    name: text({
      isIndexed: 'unique',
      label: '標籤名稱',
      validation: { isRequired: true },
    }),
    posts: relationship({
      ref: 'Post.tags',
      many: true,
      ui: {
        hideCreate: true,
        views: './lists/views/sorted-relationship-filter-draft-selfpost/index',
      },
    }),
    posts_algo: relationship({
      ref: 'Post.tags_algo',
      many: true,
      ui: {
        hideCreate: true,
        views: './lists/views/sorted-relationship/index',
      },
    }),
    externals: relationship({
      ref: 'External.tags',
      many: true,
      ui: {
        hideCreate: true,
        views: './lists/views/sorted-relationship/index',
      },
    }),
    topics: relationship({
      ref: 'Topic.tags',
      many: true,
      ui: {
        // 只隱藏 CMS 畫面，欄位/關聯/GraphQL 仍在
        hideCreate: true,
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'hidden' },
        listView: { fieldMode: 'hidden' },
      },
    }),
  },
  ui: {
    labelField: 'name',
    listView: {
      initialColumns: ['id', 'name', 'slug', 'posts'],
      initialSort: { field: 'id', direction: 'DESC' },
      pageSize: 50,
    },
  },
  access: {
    operation: {
      query: allowRoles(admin, moderator, editor),
      update: allowRoles(admin, moderator, editor),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator, editor),
    },
  },
  hooks: {
    resolveInput: ({ operation, resolvedData }) => {
      const { slug } = resolvedData
      if (operation === 'create' && (!slug || !slug.trim())) {
        /**
         * @see https://www.mongodb.com/docs/manual/reference/method/ObjectId/
         */
        const getMongoObjectId = () => {
          const timestamp = ((new Date().getTime() / 1000) | 0).toString(16)
          return (
            timestamp +
            'xxxxxxxxxxxxxxxx'
              .replace(/[x]/g, () => {
                return ((Math.random() * 16) | 0).toString(16)
              })
              .toLowerCase()
          )
        }

        return {
          ...resolvedData,
          slug: getMongoObjectId(),
        }
      }
      return resolvedData
    },
    validateInput: ({ resolvedData, addValidationError }) => {
      const { slug } = resolvedData
      if (slug === '') {
        addValidationError('slug 不得為空值')
      }
    },
    afterOperation: async ({ operation, originalItem, context }) => {
      // Tag 刪除時，把 group 專題 groupTags 裡指向此 tag 的那格清空（含對應文字）
      if (operation !== 'delete' || !originalItem?.id) return
      const deletedTagId = String(originalItem.id)
      try {
        const prisma = (context as any).prisma
        const needle = JSON.stringify([{ tagId: deletedTagId }])
        const affected: Array<{ id: number; state: string | null }> =
          await prisma.$queryRaw`
          UPDATE "Topic" t
          SET "groupTags" = (
            CASE WHEN EXISTS (
              SELECT 1 FROM jsonb_array_elements(t."groupTags") x
              WHERE (x->>'tagId') IS NOT NULL AND (x->>'tagId') <> ${deletedTagId}
            )
            THEN (
              SELECT jsonb_agg(
                CASE WHEN e.elem->>'tagId' = ${deletedTagId}
                     THEN jsonb_build_object('tagId', NULL, 'text', '')
                     ELSE e.elem END
                ORDER BY e.ord
              )
              FROM jsonb_array_elements(t."groupTags") WITH ORDINALITY AS e(elem, ord)
            )
            ELSE NULL END
          )
          WHERE t.type = 'group' AND t."groupTags" @> ${needle}::jsonb
          RETURNING t.id, t.state
        `
        // 已發佈的專題要重新產生 JSON，否則會是 tag 的舊資料
        for (const row of affected) {
          if (row.state === 'published') {
            fetch(envVar.topicServiceApi + '?topic_id=' + row.id, {
              method: 'GET',
            }).catch((e) =>
              console.error(
                '[Tag Delete → regen topic json] Failed:',
                row.id,
                e
              )
            )
          }
        }
      } catch (err) {
        console.error('[Tag Delete → clean groupTags] Failed:', err)
      }
    },
  },
})
export default utils.addTrackingFields(listConfigurations)
