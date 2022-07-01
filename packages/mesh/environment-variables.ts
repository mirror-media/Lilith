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
} = process.env

enum DatabaseProvider {
  Sqlite = 'sqlite',
  Postgres = 'postgresql'
}

export default {
  isUIDisabled: IS_UI_DISABLED === 'true',
  accessControlStrategy: ACCESS_CONTROL_STRATEGY || 'cms', // the value could be one of 'cms', 'gql' or 'preview'
  previewServerOrigin: PREVIEW_SERVER_ORIGIN || 'http://localhost:3001',
  database: {
    provider: DATABASE_PROVIDER === 'sqlite' ? DatabaseProvider.Sqlite : DatabaseProvider.Postgres,
    url: DATABASE_URL || 'postgres://account:passwd@localhost:5432/openwarehouse-k6',
  },
  session: {
    secret: SESSION_SECRET || 'default_session_secret_and_it_should_be_more_than_32_characters',
    maxAge: (SESSION_MAX_AGE && parseInt(SESSION_MAX_AGE)) ||  60 * 60 * 24 * 1, // 1 days
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
}
