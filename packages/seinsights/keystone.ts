import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import appConfig from './config'
import { createProxyMiddleware } from 'http-proxy-middleware'
import envVar from './environment-variables'
import express from 'express'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'

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
    files: {
      upload: 'local',
      local: {
        storagePath: appConfig.files.storagePath,
        baseUrl: appConfig.files.baseUrl,
      },
    },
    images: {
      upload: 'local',
      local: {
        storagePath: appConfig.images.storagePath,
        baseUrl: appConfig.images.baseUrl,
      },
    },
    server: {
      extendExpressApp: (app, createContext) => {
        // This middleware is available in Express v4.16.0 onwards
        // Set to 50mb because DraftJS Editor playload could be really large
        const jsonBodyParser = express.json({ limit: '50mb' })
        app.use(jsonBodyParser)

        // Check if the request is sent by an authenticated user
        const authenticationMw = async (req, res, next) => {
          const context = await createContext(req, res)
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
          pathRewrite: {
            '/preview/article': '/article',
            '/preview/specialfeature': '/specialfeature',
          },
          onProxyRes: (proxyRes) => {
            // The response from preview nuxt server might be with Cache-Control header.
            // However, we don't want to get cached responses for `draft` posts.
            // Therefore, we do not cache html response intentionlly by overwritting the Cache-Control header.
            proxyRes.headers['cache-control'] = 'no-store'
          },
        })

        // Proxy requests with `/preview/article/id` url path to preview nuxt server
        app.get(
          '/preview/article/:id',
          authenticationMw,
          previewProxyMiddleware
        )

        // Proxy requests with `/preview/specialfeature/id` url path to preview nuxt server
        app.get(
          '/preview/specialfeature/:id',
          authenticationMw,
          previewProxyMiddleware
        )

        // Proxy requests with `/_next/*` url path to preview nuxt server
        // if the request's Referer header matches `/article/:id` route.
        // That means the requests are from preview article page,
        // and we have to proxy them to preview server.
        app.get(
          '/_next/*',
          (req, res, next) => {
            const referer = req.header('referer') || ''
            // The requests are from preview article page
            if (referer.match(/\/preview\/(article|specialfeature)\/[^\/]*$/)) { // eslint-disable-line
              // go to next middleware to proxy requests to preview server
              return next()
            }

            // The requests are from CMS pages, so skip going to next middleware.
            // These requests should go to CMS's own '/_next/' routes instead.
            next('route')
          },
          createProxyMiddleware({
            target: envVar.previewServerOrigin,
            changeOrigin: true,
          })
        )
      },
    },
  })
)
