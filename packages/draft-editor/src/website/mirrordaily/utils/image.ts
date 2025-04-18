import { sha256 } from 'js-sha256'
import { RawImageFileData } from '../selector/image-uploader'

async function convertFilesToImageData(
  fileList: FileList
): Promise<RawImageFileData[]> {
  const files = Array.from(fileList)
  const tasks = files.map(
    async (file): Promise<RawImageFileData | undefined> => {
      if (!isImageFile(file)) return

      const fileNamePostfix = new Intl.DateTimeFormat('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(Date.now())

      const uInt8Data = await file.arrayBuffer()
      const name = file.name
      const positionOfLastDot = name.lastIndexOf('.')
      const filename =
        positionOfLastDot > -1
          ? `${name.slice(0, positionOfLastDot)}_${fileNamePostfix}${name.slice(
              positionOfLastDot
            )}`
          : `${name}_${fileNamePostfix}`

      return {
        uid: sha256(uInt8Data),
        name: filename,
        type: file.type,
        blobURL: convertBlobToString(file),
      }
    }
  )

  const results = await Promise.allSettled(tasks)

  return results
    .filter(
      (r): r is PromiseFulfilledResult<RawImageFileData | undefined> =>
        r.status === 'fulfilled'
    )
    .map((r) => r.value)
    .filter((r): r is RawImageFileData => Boolean(r))
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

function blobToFile(blob: Blob, fileName: string, extension: string) {
  return new File([blob], fileName, {
    type: extension,
  })
}

function convertBlobToString(blob: Blob) {
  return URL.createObjectURL(blob)
}

async function convertStringToFile(
  str: string,
  fileName: string,
  extension?: string
) {
  const request = new Request(str)

  return await fetch(request)
    .then((response) => response.blob())
    .then((blob) => blobToFile(blob, fileName, extension ?? blob.type))
}

export {
  convertFilesToImageData,
  isImageFile,
  convertBlobToString,
  convertStringToFile,
}
