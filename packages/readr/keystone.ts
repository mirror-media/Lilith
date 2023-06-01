import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import appConfig from './config'
import { createProxyMiddleware } from 'http-proxy-middleware'
import envVar from './environment-variables'
import express, { Request, Response, NextFunction } from 'express'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache'

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  sessionData: 'name role',
  secretField: 'password',
  initFirstItem: {
    // If there are no items in the database, keystone will ask you to create
    // a new user, filling in these fields.
    fields: ['name', 'email', 'password', 'role'],
  },
})

const session = statelessSessions(appConfig.session)

export default withAuth(
  config({
    db: {
      provider: appConfig.database.provider,
      url: appConfig.database.url,
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
    lists,
    session,
    storage: {
      files: {
        kind: 'local',
        type: 'file',
        storagePath: appConfig.files.storagePath,
        serverRoute: {
          path: '/files',
        },
        generateUrl: (path) => `/files${path}`,
      },
      images: {
        kind: 'local',
        type: 'image',
        storagePath: appConfig.images.storagePath,
        serverRoute: {
          path: '/images',
        },
        generateUrl: (path) => `/images${path}`,
      },
    },
    graphql: {
      apolloConfig: {
        cache: new InMemoryLRUCache({
          // ~100MiB
          maxSize: Math.pow(2, 20) * envVar.memoryCacheSize,
          // 5 minutes (in milliseconds)
          ttl: envVar.memoryCacheTtl,
        }),
      },
    },
    server: {
      extendExpressApp: (app, commonContext) => {
        // This middleware is available in Express v4.16.0 onwards
        // Set to 50mb because DraftJS Editor playload could be really large
        const jsonBodyParser = express.json({ limit: '50mb' })
        app.use(jsonBodyParser)

        // Check if the request is sent by an authenticated user
        const authenticationMw = async (
          req: Request,
          res: Response,
          next: NextFunction
        ) => {
          const context = await commonContext.withRequest(req, res)
          // User has been logged in
          if (context?.session?.data?.role) {
            return next()
          }

          // Otherwise, redirect them to login page
          res.redirect('/signin')
        }

        const previewProxyMiddleware = createProxyMiddleware({
          target: envVar.previewServerOrigin,
          changeOrigin: true,
          onProxyRes: (proxyRes) => {
            // The response from preview nuxt server might be with Cache-Control header.
            // However, we don't want to get cached responses for `draft` posts.
            // Therefore, we do not cache html response intentionlly by overwritting the Cache-Control header.
            proxyRes.headers['cache-control'] = 'no-store'
          },
        })

        // Proxy requests with `/story/id` url path to preview nuxt server
        app.get('/story/:id', authenticationMw, previewProxyMiddleware)

        // Proxy requests with `/event/:slug` url path to preview nuxt server
        app.get('/event/:slug', authenticationMw, previewProxyMiddleware)

        // Proxy requests with `/news/:id` url path to preview nuxt server
        app.get('/news/:id', authenticationMw, previewProxyMiddleware)

        // Proxy requests with `/_nuxt/*` url path to preview nuxt server
        app.use(
          '/_nuxt/*',
          createProxyMiddleware({
            target: envVar.previewServerOrigin,
            changeOrigin: true,
          })
        )
      },
    },
  })
)
