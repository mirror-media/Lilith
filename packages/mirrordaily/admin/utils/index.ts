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

export { createFilesHandler, isImageFile }
