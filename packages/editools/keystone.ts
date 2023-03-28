import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import appConfig from './config'
import envVar from './environment-variables'
import express from 'express'
import path from 'path'
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
      extendExpressApp: (app, createContext) => {
        // eslint-disable-next-line
        // @ts-ignore
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

        app.get('/demo/karaokes/:id', authenticationMw, async (req, res) => {
          const karaokeId = req.params.id

          const context = await createContext(req, res)
          const item = await context.query.Karaoke.findOne({
            where: { id: karaokeId },
            query: 'embedCode',
          })

          if (!item) {
            return res.status(404).send(`Karaoke ${karaokeId} is not found`)
          }

          res.send(
            `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div style="height: 80vh; background-color: pink;"></div>${item?.embedCode}<div style="height: 80vh; background-color: pink;"></div></body></html>`
          )
        })

        app.get(
          '/demo/feedback-counter/:id',
          authenticationMw,
          async (req, res) => {
            const itemId = req.params.id

            const context = await createContext(req, res)
            const item = await context.query.FeedbackCounter.findOne({
              where: { id: itemId },
              query: 'embeddedCode',
            })

            if (!item) {
              return res
                .status(404)
                .send(`FeedbackCounter ${itemId} is not found`)
            }

            res.send(
              `<html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body>
                  <div style="width: 100vw; height: 100vh;">
                    ${item?.embeddedCode}
                  </div>
                </body>
              </html>`
            )
          }
        )

        app.get(
          '/demo/inline-indices/:id',
          authenticationMw,
          async (req, res) => {
            const inlineIndicesId = req.params.id
            const context = await createContext(req, res)
            const item = await context.query.InlineIndex.findOne({
              where: { id: inlineIndicesId },
              query: `
                embedCode
                index {
                  order
                  embedCode
                }
              `,
            })
            if (!item) {
              return res
                .status(404)
                .send(`Inline-Index ${inlineIndicesId} is not found`)
            }

            res.send(
              `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div style="margin: 0 auto; max-width: 600px;">${
                item?.embedCode
              }</div>${item.index
                // TODO: should be fixed
                // @ts-ignore: wait for type definition
                ?.sort((a, b) => a.order - b.order)
                // TODO: should be fixed
                // @ts-ignore: wait for type definition
                .map((index) => index.embedCode)}</html>`
            )
          }
        )

        app.get(
          '/demo/video-picker/:id',
          authenticationMw,
          async (req, res) => {
            const itemId = req.params.id

            const context = await createContext(req, res)
            const item = await context.query.VideoPicker.findOne({
              where: { id: itemId },
              query: 'embedCode',
            })

            if (!item) {
              return res
                .status(404)
                .send(`ThreeStoryPoint ${itemId} is not found`)
            }

            res.send(
              `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${item?.embedCode}</body></html>`
            )
          }
        )

        app.get(
          '/demo/three-story-points/:id',
          authenticationMw,
          async (req, res) => {
            const itemId = req.params.id

            const context = await createContext(req, res)
            const item = await context.query.ThreeStoryPoint.findOne({
              where: { id: itemId },
              query: 'embedCode',
            })

            if (!item) {
              return res
                .status(404)
                .send(`ThreeStoryPoint ${itemId} is not found`)
            }

            res.send(
              `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${item?.embedCode}</body></html>`
            )
          }
        )

        app.get('/demo/dual-slides/:id', authenticationMw, async (req, res) => {
          const itemId = req.params.id

          const context = await createContext(req, res)
          const item = await context.query.DualSlide.findOne({
            where: { id: itemId },
            query: 'embedCode',
          })

          if (!item) {
            return res.status(404).send(`DualSlide ${itemId} is not found`)
          }

          res.send(
            `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style> * { box-sizing: border-box; } body { margin:0; } </style></head><body>${item?.embedCode}</body></html>`
          )
        })

        // ThreeJS router
        app.use(
          '/three',
          // Serve static files, including js, css and html
          // BTW, the reason we use `process.cwd()` rather than `__dirname`
          // is because `__dirname` won't return the correct absolute path;
          // it return a wrong relative path `../..`.
          // I think it is a bug for `@keystone/core`.
          express.static(path.resolve(process.cwd(), './public/three'))
        )
      },
    },
  })
)
