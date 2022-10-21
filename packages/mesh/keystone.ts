import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import appConfig from './config'
import { createProxyMiddleware } from 'http-proxy-middleware'
import envVar from './environment-variables'
import express from 'express'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';

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
	graphql: {
	  apolloConfig: {
		cache: new InMemoryLRUCache({
		  // ~100MiB
		  maxSize: Math.pow(2, 20) * envVar.memoryCacheSize,
		  // 5 minutes (in milliseconds)
		  ttl: envVar.memoryCacheTtl,
		}),		
	  }
	},
    images: {
      upload: 'local',
      local: {
        storagePath: appConfig.images.storagePath,
        baseUrl: appConfig.images.baseUrl,
      },
    },
  })
)
