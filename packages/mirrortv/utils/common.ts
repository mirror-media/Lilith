function getFileURL(bucket: string, path: string, filename: string): string {
  return `https://${bucket}${path}/${filename}`
}

export { getFileURL }
