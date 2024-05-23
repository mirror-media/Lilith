import envVar from './environment-variables'

const database: { provider: 'postgresql' | 'sqlite'; url: string } = {
  provider: envVar.database.provider,
  url: envVar.database.url,
}

const session: { secret: string; maxAge: number } = {
  secret: envVar.session.secret,
  maxAge: envVar.session.maxAge,
}

const storage = {
  gcpUrlBase: `https://storage.googleapis.com/${envVar.gcs.bucket}/`,
  webUrlBase: `https://storage.googleapis.com/${envVar.gcs.bucket}/`,
  bucket: envVar.gcs.bucket,
  filename: 'original',
}

const googleCloudStorage = {
  bucket: envVar.gcs.bucket,
}

const files = {
  baseUrl: envVar.files.baseUrl,
  storagePath: envVar.files.storagePath,
}

const images = {
  baseUrl: envVar.images.baseUrl,
  storagePath: envVar.images.storagePath,
}

export default {
  database,
  session,
  storage,
  googleCloudStorage,
  files,
  images,
}
