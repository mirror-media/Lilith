const {
  IS_UI_DISABLED,
  ACCESS_CONTROL_STRATEGY,
  PREVIEW_SERVER_ORIGIN,
  DATABASE_PROVIDER,
  DATABASE_URL,
  SESSION_SECRET,
  SESSION_MAX_AGE,
  GCS_BASE_URL,
  FILES_STORAGE_PATH,
  IMAGES_STORAGE_PATH,
  LIVEBLOG_FILES_STORAGE_PATH,
  MEMORY_CACHE_TTL,
  MEMORY_CACHE_SIZE,
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
    url:
      DATABASE_URL ||
      'postgres://account:passwd@localhost:5432/lilith-editools',
  },
  session: {
    secret:
      SESSION_SECRET ||
      'default_session_secret_and_it_should_be_more_than_32_characters',
    maxAge: (SESSION_MAX_AGE && parseInt(SESSION_MAX_AGE)) || 60 * 60 * 24 * 1, // 1 days
  },
  files: {
    gcsBaseUrl: GCS_BASE_URL || 'https://editools-gcs-dev.readr.tw',
    storagePath: FILES_STORAGE_PATH || 'public/files',
  },
  images: {
    gcsBaseUrl: GCS_BASE_URL || 'https://editools-gcs-dev.readr.tw',
    storagePath: IMAGES_STORAGE_PATH || 'public/images',
  },
  liveblogFiles: {
    storagePath: LIVEBLOG_FILES_STORAGE_PATH || 'public/files/liveblogs/',
  },
}
