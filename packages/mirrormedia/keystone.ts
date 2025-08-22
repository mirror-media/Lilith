import 'dotenv/config'
import { config } from '@keystone-6/core'
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
  apolloConfig:
    envVar.accessControlStrategy === 'gql' && envVar.cache.isEnabled
      ? {
          plugins: [
            responseCachePlugin({
              extraCacheKeyData: async (requestContext) => {
                const scope = requestContext.request.http?.headers.get(
                  'x-access-token-scope'
                )
                const acl =
                  typeof scope === 'string'
                    ? scope.match(/read:member-posts:([^\s]*)/i)?.[1]
                    : ''

                /**
                 * 目前僅有文章有權限設定，因此，在 cache 時，需藉由 request 的權限設定，來產生對應的 cache key
                 *
                 * @see https://www.apollographql.com/docs/apollo-server/performance/caching#configuring-reads-and-writes
                 * @see https://github.com/mirror-media/weekly-api-server/blob/226f7a39179901d76e681417442b13ed27db502d/src/middlewares/auth.js#L137
                 */
                return {
                  'member-post-acl': acl,
                }
              },
            }),
            ApolloServerPluginCacheControl({
              defaultMaxAge: envVar.cache.maxAge,
            }),
          ],
          cache: new KeyvAdapter(
            new Keyv(envVar.cache.url, {
              lazyConnect: true,
              namespace: envVar.cache.identifier,
              connectionName: envVar.cache.identifier,
              connectTimeout: envVar.cache.connectTimeOut,
            })
          ),
        }
      : undefined,
}

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
    graphql: graphqlConfig,
    lists,
    session,
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
