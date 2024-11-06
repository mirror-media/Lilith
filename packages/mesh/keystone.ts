import { config } from '@keystone-6/core'
import { listDefinition as lists } from './lists'
import appConfig from './config'
import envVar from './environment-variables'
import { createAuth } from '@keystone-6/auth'
import { statelessSessions } from '@keystone-6/core/session'
import Keyv from 'keyv'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl'
import responseCachePlugin from '@apollo/server-plugin-response-cache'

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

const graphqlConfig: GraphQLConfig = {
  apolloConfig:
    envVar.accessControlStrategy === 'gql' && envVar.cache.isEnabled
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
    graphql: graphqlConfig,
    images: {
      upload: 'local',
      local: {
        storagePath: appConfig.images.storagePath,
        baseUrl: appConfig.images.baseUrl,
      },
    },
  })
)
