import { ACL } from './type'

const {
  IS_UI_DISABLED,
  ACCESS_CONTROL_STRATEGY,
  PREVIEW_SERVER_ORIGIN,
  PREVIEW_SERVER_PATH,
  DATABASE_PROVIDER,
  DATABASE_URL,
  SESSION_SECRET,
  SESSION_MAX_AGE,
  GCS_BUCKET,
  FILES_BASE_URL,
  FILES_STORAGE_PATH,
  IMAGES_BASE_URL,
  IMAGES_STORAGE_PATH,
  VIDEOS_BASE_URL,
  VIDEOS_STORAGE_PATH,
  LOCK_DURATION,
  IS_CACHE_ENABLED,
  REDIS_SERVER,
  CACHE_IDENTIFIER,
  CACHE_CONNECT_TIMEOUT,
  CACHE_MAXAGE,
  DATA_SERVICE_API,
  TOPIC_SERVICE_API,
  AUTO_TAGGING,
  INVALID_CDN_CACHE_SERVER_URL,
} = process.env

enum DatabaseProvider {
  Sqlite = 'sqlite',
  Postgres = 'postgresql',
}

const cacheMaxAge = Number(CACHE_MAXAGE)
const cacheConnectTimeout = Number(CACHE_CONNECT_TIMEOUT)

export default {
  isUIDisabled: IS_UI_DISABLED === 'true',
  accessControlStrategy: ACCESS_CONTROL_STRATEGY || ACL.CMS, // the value could be one of 'cms', 'gql' or 'preview'
  previewServer: {
    origin: PREVIEW_SERVER_ORIGIN || 'http://localhost:3001',
    path: PREVIEW_SERVER_PATH || '/preview-server',
  },
  database: {
    provider:
      DATABASE_PROVIDER === 'sqlite'
        ? DatabaseProvider.Sqlite
        : DatabaseProvider.Postgres,
    url:
      DATABASE_URL || 'postgres://username:password@localhost:5432/mirrordaily',
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
  videos: {
    baseUrl: VIDEOS_BASE_URL || '/video-files',
    storagePath: VIDEOS_STORAGE_PATH || 'public/video-files',
  },
  lockDuration:
    (typeof LOCK_DURATION === 'string' && parseInt(LOCK_DURATION)) || 30,
  cache: {
    isEnabled: IS_CACHE_ENABLED === 'true',
    identifier: CACHE_IDENTIFIER ?? 'weekly-cms',
    url: REDIS_SERVER ?? '',
    connectTimeOut: Number.isNaN(cacheConnectTimeout)
      ? 1000 * 10
      : cacheConnectTimeout, // unit: millisecond
    maxAge: Number.isNaN(cacheMaxAge) ? 60 : cacheMaxAge, // unit: second
  },
  dataServiceApi: DATA_SERVICE_API,
  topicServiceApi: TOPIC_SERVICE_API,
  autotagging: AUTO_TAGGING || 'false',
  invalidateCDNCacheServerURL: INVALID_CDN_CACHE_SERVER_URL,
}
