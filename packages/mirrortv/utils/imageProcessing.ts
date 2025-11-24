import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { Storage } from '@google-cloud/storage'
import envVar from '../environment-variables'

const IS_GCS_MODE = false
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let bucket: any = null

if (IS_GCS_MODE) {
  const storage = new Storage()
  bucket = storage.bucket(envVar.gcs.bucket)
}

const WATERMARK_PATH = path.join(process.cwd(), 'public/images/watermark.png')
const LOCAL_STORAGE_PATH = path.join(process.cwd(), 'public/images')
const LOCAL_BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// 統一管理尺寸與檔名後綴
const RESIZE_TARGETS = {
  tiny: { width: 150, suffix: '-tiny' },
  mobile: { width: 480, suffix: '-w480' },
  tablet: { width: 800, suffix: '-w800' },
  desktop: { width: 1200, suffix: '-w1200' },
  original: { width: null, suffix: '' },
}

async function uploadToGCS(
  buffer: Buffer,
  destination: string,
  contentType: string
) {
  const file = bucket.file(destination)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await file.save(buffer as any, {
    metadata: { contentType, cacheControl: 'public, max-age=31536000' },
    resumable: false,
  })
  const baseUrl = (envVar.gcs as any).baseUrl || `https://${envVar.gcs.bucket}`
  return `${baseUrl}/${destination}`
}

async function saveToLocal(buffer: Buffer, filename: string) {
  if (!fs.existsSync(LOCAL_STORAGE_PATH)) {
    fs.mkdirSync(LOCAL_STORAGE_PATH, { recursive: true })
  }
  const filePath = path.join(LOCAL_STORAGE_PATH, filename)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await fs.promises.writeFile(filePath, buffer as any)
  return `${LOCAL_BASE_URL}/images/${filename}`
}

export async function processAndUploadImages(
  localFilePath: string,
  fileId: string,
  extension: string,
  needWatermark = false
) {
  console.log(`[ImageProcessing] Mode: ${IS_GCS_MODE ? 'GCS' : 'Local'}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiData: Record<string, any> = {}
  const storagePrefix = envVar.images.baseUrl || 'images/'

  let imageBuffer = await fs.promises.readFile(localFilePath)
  const imagePipeline = sharp(imageBuffer)
  const metadata = await imagePipeline.metadata()

  if (needWatermark && fs.existsSync(WATERMARK_PATH)) {
    const watermarkBuffer = await fs.promises.readFile(WATERMARK_PATH)
    imageBuffer = await imagePipeline
      .composite([{ input: watermarkBuffer, gravity: 'southeast' }])
      .toBuffer()
  }

  const promises = Object.entries(RESIZE_TARGETS).map(async ([key, config]) => {
    const fileNameFull = IS_GCS_MODE
      ? `${storagePrefix}${fileId}${config.suffix}.${extension}`
      : `${fileId}${config.suffix}.${extension}`

    let resizeBuffer = imageBuffer
    if (config.width) {
      resizeBuffer = await sharp(imageBuffer)
        .resize({ width: config.width, withoutEnlargement: true })
        .toBuffer()
    }

    const publicUrl = IS_GCS_MODE
      ? await uploadToGCS(
          resizeBuffer,
          fileNameFull,
          `image/${extension === 'jpg' ? 'jpeg' : extension}`
        )
      : await saveToLocal(resizeBuffer, fileNameFull)

    apiData[key] = {
      url: publicUrl,
      width: config.width || metadata.width,
      height: config.width ? undefined : metadata.height,
    }
  })

  await Promise.all(promises)
  return apiData
}

export async function deleteImagesFromGCS(fileId: string, extension: string) {
  const storagePrefix = envVar.images.baseUrl || 'images/'
  const suffixes = ['', '-tiny', '-w480', '-w800', '-w1200', '-w1600', '-w2400']

  await Promise.all(
    suffixes.map(async (suffix) => {
      const filename = `${fileId}${suffix}.${extension}`
      try {
        if (IS_GCS_MODE) {
          await bucket.file(`${storagePrefix}${filename}`).delete()
        } else {
          const localPath = path.join(LOCAL_STORAGE_PATH, filename)
          if (fs.existsSync(localPath)) await fs.promises.unlink(localPath)
        }
      } catch (e) {
        /* ignore missing files */
      }
    })
  )
}
