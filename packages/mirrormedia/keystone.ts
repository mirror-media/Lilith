import 'dotenv/config'
import { config, graphql } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import envVar from './environment-variables'
import express from 'express'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'
import { createPreviewMiniApp } from './express-mini-apps/preview/app'
import Keyv from 'keyv'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl'
import responseCachePlugin from '@apollo/server-plugin-response-cache'
import { GraphQLConfig } from '@keystone-6/core/types'
import { utils } from '@mirrormedia/lilith-core'

// 获取 createLoginLoggingPlugin 函数（兼容新旧版本）
const createLoginLoggingPlugin =
  (utils as any).createLoginLoggingPlugin ||
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@mirrormedia/lilith-core/lib/utils/login-logging')
    ?.createLoginLoggingPlugin ||
  (() => {
    console.warn(
      'createLoginLoggingPlugin not available, login logging disabled'
    )
    return {}
  })

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'id name role',
  secretField: 'password',
  initFirstItem: {
    // If there are no items in the database, keystone will ask you to create
    // a new user, filling in these fields.
    fields: ['name', 'email', 'password', 'role'],
  },
})

const session = statelessSessions(envVar.session)

const graphqlConfig: GraphQLConfig = {
  apolloConfig: {
    plugins: [
      createLoginLoggingPlugin(),
      ...(envVar.accessControlStrategy === 'gql' && envVar.cache.isEnabled
        ? [
            responseCachePlugin(),
            ApolloServerPluginCacheControl({
              defaultMaxAge: envVar.cache.maxAge,
            }),
          ]
        : []),
    ],
    ...(envVar.accessControlStrategy === 'gql' && envVar.cache.isEnabled
      ? {
          cache: new KeyvAdapter(
            new Keyv(envVar.cache.url, {
              lazyConnect: true,
              namespace: envVar.cache.identifier,
              connectionName: envVar.cache.identifier,
              connectTimeout: envVar.cache.connectTimeOut,
            })
          ),
        }
      : {}),
  } as any,
} as GraphQLConfig

export default withAuth(
  config({
    db: {
      provider: envVar.database.provider,
      url: envVar.database.url,
      idField: {
        kind: 'autoincrement',
      },
    },
    ui: {
      // If `isDisabled` is set to `true` then the Admin UI will be completely disabled.
      isDisabled: envVar.isUIDisabled,
      // For our starter, we check that someone has session data before letting them see the Admin UI.
      isAccessAllowed: (context) => !!context.session?.data,
    },
    graphql: graphqlConfig as any,
    lists,
    session,
    // Extended GraphQL schema for related posts selection (bypass access filter)
    extendGraphqlSchema: graphql.extend(() => {
      // Define a minimal type for relationship selection (only expose necessary fields)
      const PostForRelation = graphql.object<{
        id: string
        title: string
        slug: string
      }>()({
        name: 'PostForRelation',
        fields: {
          id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
          title: graphql.field({ type: graphql.String }),
          slug: graphql.field({ type: graphql.String }),
        },
      })

      return {
        query: {
          // Query to get posts for relation field (bypasses access filter)
          // Security: Only returns minimal fields (id, title, slug) for dropdown display
          allPostsForRelation: graphql.field({
            type: graphql.list(graphql.nonNull(PostForRelation)),
            args: {
              where: graphql.arg({ type: graphql.JSON }),
              take: graphql.arg({ type: graphql.Int }),
              skip: graphql.arg({ type: graphql.Int }),
              orderBy: graphql.arg({ type: graphql.JSON }),
            },
            resolve: async (_root, args, context) => {
              // Security: Require authentication
              if (!context.session?.data) {
                throw new Error('Authentication required')
              }

              const sudoContext = context.sudo()
              const posts = await sudoContext.db.Post.findMany({
                where: args.where ?? undefined,
                take: args.take ?? undefined,
                skip: args.skip ?? undefined,
                orderBy: args.orderBy ?? undefined,
              })

              // Only return minimal fields through the GraphQL type
              return posts.map((post) => ({
                id: String(post.id),
                title: post.title,
                slug: post.slug,
              }))
            },
          }),
          // Count query for pagination
          allPostsForRelationCount: graphql.field({
            type: graphql.Int,
            args: {
              where: graphql.arg({ type: graphql.JSON }),
            },
            resolve: async (_root, args, context) => {
              // Security: Require authentication
              if (!context.session?.data) {
                throw new Error('Authentication required')
              }

              const sudoContext = context.sudo()
              return sudoContext.db.Post.count({
                where: args.where ?? undefined,
              })
            },
          }),
        },
      }
    }),
    storage: {
      files: {
        kind: 'local',
        type: 'file',
        storagePath: envVar.files.storagePath,
        serverRoute: {
          path: '/files',
        },
        generateUrl: (path) => `${envVar.files.baseUrl}${path}`,
      },
      images: {
        kind: 'local',
        type: 'image',
        storagePath: envVar.images.storagePath,
        serverRoute: {
          path: '/images',
        },
        generateUrl: (path) => `${envVar.images.baseUrl}${path}`,
      },
    },
    server: {
      healthCheck: {
        path: '/health_check',
        data: { status: 'healthy' },
      },
      maxFileSize: 2000 * 1024 * 1024,
      extendExpressApp: (app, context) => {
        // This middleware is available in Express v4.16.0 onwards
        // Set to 50mb because DraftJS Editor playload could be really large

        const jsonBodyParser = express.json({ limit: '500mb' })
        app.use(jsonBodyParser)

        if (envVar.accessControlStrategy === 'cms') {
          app.use(
            createPreviewMiniApp({
              previewServer: envVar.previewServer,
              keystoneContext: context,
            })
          )
        }
      },
    },
  })
)
