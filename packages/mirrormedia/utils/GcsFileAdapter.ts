import fs from 'fs'
import zlib from 'zlib'
// import getAudioDurationInSeconds from 'get-audio-duration'
import { Storage } from '@google-cloud/storage'
import config from '../config'

const { bucket, gcpUrlBase, webUrlBase } = config.storage

// gcs上傳相關
const gcskeyfilePath = './configs/gcskeyfile.json'
process.env.GOOGLE_APPLICATION_CREDENTIALS = gcskeyfilePath

const gcsStorage = new Storage()
const gcsBucket = gcsStorage.bucket(bucket)

export class GcsFileAdapter {
  fileType: string
  #filename: string
  #filenameStoredInLocal: string
  #mimetype: string
  #encoding: string
  #fileExt: string
  #fileId: string
  #filenameForUploading: string
  meta: any
  #fileReadStream: fs.ReadStream | undefined
  constructor(fileType = 'audio') {
    this.fileType = fileType

    // 檔案所有的基本資訊
    this.#filename = '' // 檔案原始名稱
    this.#mimetype = '' // 檔案種類
    this.#encoding = '' // 檔案encoding方式
    this.#filenameStoredInLocal = '' // File Field會將檔案以此名字存到public/file中
    this.#fileExt = '' // 檔案副檔名
    this.#fileId = '' // 檔案id
    this.#filenameForUploading = '' // 上傳到Gcs後，檔案應該要用的名字（格式為id.ext）

    this.#fileReadStream = undefined

    this.meta = {}
  }

  // 主要流程
  async startFileProcessingFlow(
    resolvedData: { [x: string]: any },
    item: {
      [x: string]: unknown
      id?: { toString(): string }
      file_filename?: any
    },
    inputData: { [x: string]: any }
  ) {
    // 註：k6會幫我們上傳以下名稱格式的檔案到local：
    // 檔案名稱-SDAeiB5oQVaDXvrPYa.mp3
    const currentFilename = resolvedData?.file?.filename
    const prevFilename = item?.file_filename

    const isNeedToUploadFile = !!currentFilename
    const isNeedToDeleteFile = !!prevFilename

    if (isNeedToUploadFile) {
      // 上傳流程1: 替gcsFileAdapter灌入file必要資料
      const basicInfo = await inputData?.file?.upload
      this.feedBasicInfo({
        basicInfo: {
          ...basicInfo,
          filenameStoredInLocal: currentFilename,
        },
      })

      // 上傳流程2: 一個function無痛上傳
      await this.startUploadProcess()

      // 上傳流程3: 將上傳完後的結果資料回放至resolvedData以更新list

      this.#feedUrlToResolvedData(resolvedData)

      // 上傳流程3.5: 把檔案名稱改寫成id.ext格式，讓之後刪除GCS檔案較為方便
      resolvedData.file.filename = this.#filenameForUploading
    }

    // if (isNeedToDeleteFile) {
    //   this.startDeleteProcess(prevFilename)
    // }
  }

  feedBasicInfo({
    basicInfo,
  }: {
    basicInfo: {
      filename: string
      mimetype: string
      encoding: string
      filenameStoredInLocal: string
    }
  }) {
    // 在上傳之前，需要先補齊檔案所有的基本資訊
    const { filename, mimetype, encoding, filenameStoredInLocal } = basicInfo

    // 拆分filenameStoredInLocal,提取裡頭的id以及ext（副檔名）
    // 格式範例：picture-FQMmNZSxjmAoeGFeWNW.png
    const filenameArray = filenameStoredInLocal.split('.')
    const fileExt = filenameArray.pop()
    const filenameNameOnlyArray = filenameArray[0].split('-')
    const fileId = filenameNameOnlyArray[filenameNameOnlyArray.length - 1]

    // 將檔案所有資訊丟到this中供他處使用
    this.#filenameStoredInLocal = filenameStoredInLocal
    this.#fileExt = fileExt
    this.#fileId = fileId
    this.#filename = filename
    this.#mimetype = mimetype
    this.#encoding = encoding

    // 檔案上傳至GCP的名稱規定為：id.ext
	if (config.storage.filename == 'original') {
    	this.#filenameForUploading = `${this.#filename}`
	} else {
    	this.#filenameForUploading = `${this.#fileId}.${this.#fileExt}`
	}
  }

  // 上傳細部流程
  async startUploadProcess() {
    await this.#generateFileMeta()
    await this.#startUpload()
  }

  #generateFileMeta() {
    // get file url in gcs
    // TODO: 未來網址做了proxy之後，就可以將gcpUrlBase換成webUrlBase
    const fileUrl = `${gcpUrlBase}${getFileUrlBase(this.fileType)}${
      this.#filenameForUploading
    }`

    this.meta.fileUrl = fileUrl

    // TODO: audio以及video的duration（m1不支援k5的get-audio/video-duration package....）
    switch (this.fileType) {
      case 'audio':
        // this.getAudioDuration()
        break

      case 'video':
        // this.getVideoDuration()
        break

      default:
      case 'file':
        break
    }
  }

  // 上傳檔案至GCS
  #startUpload() {
    return new Promise((resolve, reject) => {
      this.#fileReadStream = this.#createFileReadStream()

      const write = this.#getGcsUploadPipeProcess(
        this.#filenameForUploading,
        resolve,
        reject
      )

      this.#fileReadStream.pipe(write)
    })
  }

  #getGcsUploadPipeProcess(filenameInGcs: string, resolve, reject) {
    const fileGcsUrl = `${getFileUrlBase(this.fileType)}${filenameInGcs}`

    const file = gcsBucket.file(fileGcsUrl)
    const write = file.createWriteStream(getGcsOptions())

    write.on('finish', () => {
      resolve()
    })

    write.on('error', (error) => {
      // TODO: better error logging
      console.log('error happend')
      console.log(error)
      reject()
    })
    return write
  }

  #createFileReadStream() {
    const fileLocalPath = `./public/files/${this.#filenameStoredInLocal}`

    const fileReadStream = fs.createReadStream(fileLocalPath)

    // 建立整個stream完成後的callback
    fileReadStream.on('end', () => {
      fs.unlink(fileLocalPath, () => {})
    })
    // 建立整個stream失敗後的callback
    fileReadStream.on('error', (error) => {
      // TODO: better error logging
      console.log('error happend')
      console.log(error)
    })

    return fileReadStream
  }

  // 刪除GCS上的檔案
  async startDeleteProcess(filenameInDb: string) {
    await this.#deleteGcsFile(filenameInDb)
  }

  async #deleteGcsFile(filenameInGcs: string) {
    try {
      const fileGcsUrl = `${getFileUrlBase(this.fileType)}${filenameInGcs}`

      await gcsBucket.file(fileGcsUrl).delete()
    } catch (error) {
      // TODO: better error logging
      console.log('error happend while deleting file' + error)
    }
  }

  #feedUrlToResolvedData(resolvedData) {
    switch (this.fileType) {
      case 'image':
        resolvedData.urlOriginal = this.meta.fileUrl
        break

      default:
        resolvedData.url = this.meta.fileUrl
        break
    }
  }

  // unuse
  #saveToLocal(filename) {
    const savePath = `./public/files/${filename}`
    return fs.createWriteStream(savePath)
  }

  #zipFile() {
    return zlib.createGzip()
  }
}

function getFileUrlBase(fileType) {
  switch (fileType) {
    case 'audio':
      return 'audios/'

    case 'video':
      return 'videos/'

    case 'image':
      return 'images/'

    default:
    case 'file':
      return 'assets/files/'
  }
}

function getGcsOptions() {
  return {
    gzip: false,
    public: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  }
}
