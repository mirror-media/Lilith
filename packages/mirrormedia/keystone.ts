import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import appConfig from './config'
import envVar from './environment-variables'
import express from 'express'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'
import { createApp as createPremiumMemberMiniApp } from './express-mini-apps/premium-membership/app'
import { createPreviewMiniApp } from './express-mini-apps/preview/app'

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

        if (envVar.accessControlStrategy === 'cms') {
          app.use(
            createPreviewMiniApp({
              previewServerOrigin: envVar.previewServerOrigin,
              createContext,
            })
          )
        }

        if (envVar.accessControlStrategy === 'gql') {
          app.use(
            createPremiumMemberMiniApp({
              gcpProjectId: envVar.gcp.projectId,
              firebaseProjectId: envVar.firebase.projectId,
              memberApiUrl: envVar.memberApiUrl,
              jwtSecret: envVar.jwt.secret,
              corsAllowOrigin: envVar.cors.allowOrigins,
            })
          )
        }
      },
    },
  })
)
