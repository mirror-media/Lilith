import 'dotenv/config'
import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import envVar from './environment-variables'
import express from 'express'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'
import { createPreviewMiniApp } from './express-mini-apps/preview/app'
import { createDashboardMiniApp } from './express-mini-apps/dashboard/app'
import Keyv from 'keyv'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl'
import responseCachePlugin from '@apollo/server-plugin-response-cache'
import { GraphQLConfig } from '@keystone-6/core/types'
import { ACL } from './type'

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
    envVar.accessControlStrategy === ACL.GraphQL && envVar.cache.isEnabled
      ? {
          plugins: [
            responseCachePlugin(),
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
          path: envVar.files.baseUrl,
        },
        generateUrl: (path) => `${envVar.files.baseUrl}${path}`,
      },
      images: {
        kind: 'local',
        type: 'image',
        storagePath: envVar.images.storagePath,
        serverRoute: {
          path: envVar.images.baseUrl,
        },
        generateUrl: (path) => `${envVar.images.baseUrl}${path}`,
      },
      videos: {
        kind: 'local',
        type: 'file',
        storagePath: envVar.videos.storagePath,
        serverRoute: {
          path: envVar.videos.baseUrl,
        },
        generateUrl: (path) => `${envVar.videos.baseUrl}${path}`,
      },
    },
    server: {
      healthCheck: {
        path: '/health_check',
        data: { status: 'healthy' },
      },
      maxFileSize: 8000 * 1024 * 1024,
      extendExpressApp: (app, context) => {
        // This middleware is available in Express v4.16.0 onwards
        // Set to 50mb because DraftJS Editor playload could be really large

        const jsonBodyParser = express.json({ limit: '500mb' })
        app.use(jsonBodyParser)

        // Apply X-Robots-Tag header to all Keystone backend responses
        app.use((_, res, next) => {
          res.set('X-Robots-Tag', 'noindex, nofollow, noimageindex')
          next()
        })

        if (envVar.accessControlStrategy === ACL.CMS) {
          // Serve robots.txt only in CMS domain to block all crawlers.
          app.get('/robots.txt', (_, res) => {
            res.type('text/plain')
            res.send(`User-agent: *
Disallow: /`)
          })

          app.use(
            createPreviewMiniApp({
              previewServer: envVar.previewServer,
              keystoneContext: context,
            })
          )

          app.use(
            createDashboardMiniApp({
              dashboardServer: envVar.dashboardServer,
              keystoneContext: context,
            })
          )
        }
      },
    },
  })
)
