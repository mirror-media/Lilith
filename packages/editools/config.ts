import envVar from './environment-variables'

const database: { provider: 'postgresql' | 'sqlite'; url: string } = {
  provider: envVar.database.provider,
  url: envVar.database.url,
}

const session: { secret: string; maxAge: number } = {
  secret: envVar.session.secret,
  maxAge: envVar.session.maxAge,
}

const files = {
  gcsBaseUrl: envVar.files.gcsBaseUrl,
  storagePath: envVar.files.storagePath,
}

const images = {
  gcsBaseUrl: envVar.images.gcsBaseUrl,
  storagePath: envVar.images.storagePath,
}

const liveblogFiles = {
  storagePath: envVar.liveblogFiles.storagePath,
}

export default {
  database,
  session,
  files,
  images,
  liveblogFiles,
}
