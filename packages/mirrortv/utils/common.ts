function getFileURL(bucket: string, path: string, filename: string): string {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path
  const finalPath = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath

  return `https://storage.googleapis.com/${bucket}/${finalPath}/${filename}`
}

export { getFileURL }
