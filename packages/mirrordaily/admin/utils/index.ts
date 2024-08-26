function createFilesHandler(fileHandler: (files: File[]) => void) {
  return (fileList: FileList | null) => {
    if (!fileList) return
    const amount = fileList.length
    const data: File[] = []

    for (let i = 0; i < amount; i++) {
      const file = fileList.item(i)

      if (file) data.push(file)
    }

    fileHandler(data)
  }
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
  createFilesHandler,
  isImageFile,
  convertBlobToString,
  convertStringToFile,
}
