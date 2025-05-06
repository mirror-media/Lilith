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
  IS_CACHE_ENABLED,
  MEMORY_CACHE_TTL,
  MEMORY_CACHE_SIZE,
  INVALID_CDN_CACHE_SERVER_URL,
} = process.env

enum DatabaseProvider {
  Sqlite = 'sqlite',
  Postgres = 'postgresql',
}

export default {
  isUIDisabled: IS_UI_DISABLED === 'true',
  memoryCacheTtl: Number.isNaN(Number(MEMORY_CACHE_TTL))
    ? 300_000
    : Number(MEMORY_CACHE_TTL),
  memoryCacheSize: Number.isNaN(Number(MEMORY_CACHE_SIZE))
    ? 300
    : Number(MEMORY_CACHE_SIZE),
  accessControlStrategy: ACCESS_CONTROL_STRATEGY || 'cms', // the value could be one of 'cms', 'gql' or 'preview'
  previewServerOrigin: PREVIEW_SERVER_ORIGIN || 'http://localhost:3001',
  database: {
    provider:
      DATABASE_PROVIDER === 'sqlite'
        ? DatabaseProvider.Sqlite
        : DatabaseProvider.Postgres,
    url: DATABASE_URL || 'postgres://username:password@localhost:5432/mesh',
  },
  session: {
    secret:
      SESSION_SECRET ||
      'default_session_secret_and_it_should_be_more_than_32_characters',
    maxAge: (SESSION_MAX_AGE && parseInt(SESSION_MAX_AGE)) || 60 * 60 * 24 * 1, // 1 days
  },
  gcs: {
    bucket: GCS_BUCKET || 'static-mesh-tw-dev',
  },
  files: {
    baseUrl: FILES_BASE_URL || '/files',
    storagePath: FILES_STORAGE_PATH || 'public/files',
  },
  images: {
    baseUrl: IMAGES_BASE_URL || '/images',
    storagePath: IMAGES_STORAGE_PATH || 'public/images',
  },
  cache: {
    isEnabled: IS_CACHE_ENABLED === 'true',
    identifier: CACHE_IDENTIFIER ?? 'weekly-cms',
    url: REDIS_SERVER ?? '',
    connectTimeOut: Number.isNaN(cacheConnectTimeout)
      ? 1000 * 10
      : cacheConnectTimeout, // unit: millisecond
    maxAge: Number.isNaN(cacheMaxAge) ? 60 : cacheMaxAge, // unit: second
  },
  invalidateCDNCacheServerURL: INVALID_CDN_CACHE_SERVER_URL,
}
