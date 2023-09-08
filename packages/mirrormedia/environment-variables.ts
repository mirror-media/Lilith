import Keyv from "keyv";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import responseCachePlugin from '@apollo/server-plugin-response-cache';

const {
  IS_UI_DISABLED,
  ACCESS_CONTROL_STRATEGY,
  PREVIEW_SERVER_ORIGIN,
  DATABASE_PROVIDER,
  DATABASE_URL,
  SESSION_SECRET,
  SESSION_MAX_AGE,
  GCS_BUCKET,
  FILES_BASE_URL,
  FILES_STORAGE_PATH,
  IMAGES_BASE_URL,
  IMAGES_STORAGE_PATH,
  JWT_SECRET,
  GCP_PROJECT_ID,
  FIREBASE_PROJECT_ID,
  MEMBER_API_URL,
  CORS_ALLOW_ORIGINS,
  LOCK_DURATION,
  CACHE_MAXAGE,
  REDIS_SERVER,
} = process.env

enum DatabaseProvider {
  Sqlite = 'sqlite',
  Postgres = 'postgresql',
}

export default {
  isUIDisabled: IS_UI_DISABLED === 'true',
  accessControlStrategy: ACCESS_CONTROL_STRATEGY || 'cms', // the value could be one of 'cms', 'gql' or 'preview'
  previewServerOrigin: PREVIEW_SERVER_ORIGIN || 'http://localhost:3001',
  database: {
    provider:
      DATABASE_PROVIDER === 'sqlite'
        ? DatabaseProvider.Sqlite
        : DatabaseProvider.Postgres,
    url: DATABASE_URL || 'postgres://user:password@localhost:5432/mirrormedia',
  },
  session: {
    secret:
      SESSION_SECRET ||
      'default_session_secret_and_it_should_be_more_than_32_characters',
    maxAge:
      (typeof SESSION_MAX_AGE === 'string' && parseInt(SESSION_MAX_AGE)) ||
      60 * 60 * 24 * 1, // 1 days
  },
  gcs: {
    bucket: GCS_BUCKET || 'static-vision-tw-dev',
  },
  files: {
    baseUrl: FILES_BASE_URL || '/files',
    storagePath: FILES_STORAGE_PATH || 'public/files',
  },
  images: {
    baseUrl: IMAGES_BASE_URL || '/images',
    storagePath: IMAGES_STORAGE_PATH || 'public/images',
  },
  jwt: {
    secret: JWT_SECRET || 'jwt-secret',
  },
  gcp: {
    projectId: GCP_PROJECT_ID || 'mirrormedia-1470651750304',
  },
  firebase: {
    projectId: FIREBASE_PROJECT_ID || 'mirror-weekly',
  },
  cache: {
    apolloConfig: IS_UI_DISABLED === 'true' ? 
      {
        //cacheHint: { maxAge: 120, scope: 'PUBLIC' },
		plugins: [responseCachePlugin(), ApolloServerPluginCacheControl({ defaultMaxAge: CACHE_MAXAGE })],  // 5 se
        cache: new KeyvAdapter(new Keyv(REDIS_SERVER)), 
      } : {}

  },
  memberApiUrl:
    MEMBER_API_URL || 'https://israfel-gql.mirrormedia.mg/api/graphql',
  cors: {
    allowOrigins:
      typeof CORS_ALLOW_ORIGINS === 'string'
        ? CORS_ALLOW_ORIGINS.split(',')
        : ['https://www.mirrormedia.mg', 'https://mirrormedia.mg'],
  },
  lockDuration:
    (typeof LOCK_DURATION === 'string' && parseInt(LOCK_DURATION)) || 30,
}
