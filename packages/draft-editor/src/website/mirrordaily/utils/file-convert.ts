import { sha256 } from 'js-sha256'
import { RawImageFileData } from '../selector/image-uploader'
import { VideoFileData as RawVideoFileData } from '../selector/video-uploader'

async function convertFilesToMediaData<T>(
  fileList: FileList,
  isValidFile: (file: File) => boolean,
  wrapResult: (args: {
    uid: string
    name: string
    type: string
    blobURL: string
  }) => T
): Promise<T[]> {
  const files = Array.from(fileList)

  const fileNamePostfix = new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(Date.now())

  const tasks = files.map(async (file) => {
    if (!isValidFile(file)) return

    const uInt8Data = await file.arrayBuffer()
    const name = file.name
    const positionOfLastDot = name.lastIndexOf('.')
    const filename =
      positionOfLastDot > -1
        ? `${name.slice(0, positionOfLastDot)}_${fileNamePostfix}${name.slice(
            positionOfLastDot
          )}`
        : `${name}_${fileNamePostfix}`

    return wrapResult({
      uid: sha256(uInt8Data),
      name: filename,
      type: file.type,
      blobURL: convertBlobToString(file),
    })
  })

  const results: PromiseSettledResult<T | undefined>[] =
    await Promise.allSettled(tasks)

  return results
    .filter((r): r is PromiseFulfilledResult<T> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((r): r is T => Boolean(r))
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

async function convertFilesToImageData(
  fileList: FileList
): Promise<RawImageFileData[]> {
  return convertFilesToMediaData<RawImageFileData>(
    fileList,
    isImageFile,
    ({ uid, name, type, blobURL }) => ({
      uid,
      name,
      type,
      blobURL,
    })
  )
}

async function convertFilesToVideoData(
  fileList: FileList
): Promise<RawVideoFileData[]> {
  return convertFilesToMediaData<RawVideoFileData>(
    fileList,
    isVideoFile,
    ({ uid, name, type, blobURL }) => ({
      uid,
      name,
      type,
      blobURL,
    })
  )
}

function isVideoFile(file: File) {
  return file.type.startsWith('video/')
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
  convertFilesToVideoData,
  convertBlobToString,
  convertStringToFile,
}
