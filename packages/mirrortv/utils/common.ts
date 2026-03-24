import envVar from '../environment-variables'

function getFileURL(bucket: string, path: string, filename: string): string {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  const finalPath = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath

  // 讀取環境變數，若沒有設定則 fall back 到 GCS 公開網址
  const domain = envVar.domainUrl
  if (domain && domain.startsWith('http')) {
    const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain
    return `${cleanDomain}/${finalPath}/${filename}`
  }

  return `https://storage.googleapis.com/${bucket}/${finalPath}/${filename}`
}

export { getFileURL }
