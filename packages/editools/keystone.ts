import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import appConfig from './config'
import envVar from './environment-variables'
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
            `<html><body><div style="height: 80vh; background-color: pink;"></div>${item?.embedCode}<div style="height: 80vh; background-color: pink;"></div></body></html>`
          )
        })
      },
    },
  })
)
