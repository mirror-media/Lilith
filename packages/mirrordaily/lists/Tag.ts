import { utils } from '@mirrormedia/lilith-core'
import { list } from '@keystone-6/core'
import { relationship, text } from '@keystone-6/core/fields'

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
        views: './lists/views/sorted-relationship/index',
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
      ui: { hideCreate: true },
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
      update: allowRoles(admin, moderator),
      create: allowRoles(admin, moderator, editor),
      delete: allowRoles(admin, moderator),
    },
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
      const { slug } = resolvedData
      if (!slug || !slug.trim()) {
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
  },
})
export default utils.addTrackingFields(listConfigurations)
