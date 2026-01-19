import React from 'react'
import { extractFileExtension } from '../../utils'

// 解決 'amp-video' does not exist on type 'JSX.IntrinsicElements' 錯誤
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'amp-video': any
    }
  }
}

// --- Types ---
type ImageEntity = {
  id: string
  name?: string
  file: {
    url: string
  }
  resized: {
    original: string
    w480: string
    w800: string
    w1200: string
    w1600: string
    w2400: string
  }
}

type VideoEntity = {
  id: string
  name?: string
  urlOriginal: string
  youtubeUrl?: string
  file: {
    filename?: string
    filesize: number
    url: string
  }
  heroImage: ImageEntity
}

/**
 * 取得影片預覽圖 (Poster)
 * 優先從 resized 欄位抓取 w1200 等級的縮圖以優化 AMP 效能
 */
const getVideoPoster = (heroImage: ImageEntity) => {
  if (!heroImage) return undefined
  return (
    heroImage.resized?.w1200 ||
    heroImage.resized?.original ||
    heroImage.file?.url
  )
}

/**
 * Before 202310, video which contain property `urlOriginal` and not contain property `videoSrc`.
 */
export default function AmpVideoBlock({ video }: { video: VideoEntity }) {
  const urlOriginalType = extractFileExtension(video?.urlOriginal)
  const fileUrlType = extractFileExtension(video?.file?.url)
  const posterUrl = getVideoPoster(video?.heroImage)

  return (
    <amp-video
      controls="controls"
      autoplay="autoplay"
      loop="loop"
      layout="responsive"
      width="16" // 使用比例值 (16:9) 會比 100vw 在排版上更穩定
      height="9"
      poster={posterUrl} // 加入影片預覽圖
    >
      {urlOriginalType && (
        <source src={video?.urlOriginal} type={`video/${urlOriginalType}`} />
      )}
      {fileUrlType && (
        <source src={video?.file?.url} type={`video/${fileUrlType}`} />
      )}
      <div fallback="">
        <p>您的瀏覽器不支援播放此影片。</p>
      </div>
    </amp-video>
  )
}