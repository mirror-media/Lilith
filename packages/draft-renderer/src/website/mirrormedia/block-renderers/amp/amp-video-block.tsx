import React from 'react'
import { extractFileExtension } from '../../utils'

type ImageEntity = {
  id: string
  name?: string
  imageFile: {
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
 * Before 202310, video which contain property `urlOriginal` and not contain property `videoSrc`.
 */
export default function AmpVideoBlock({ video }: { video: VideoEntity }) {
  const urlOriginalType = extractFileExtension(video?.urlOriginal)
  const fileUrlType = extractFileExtension(video?.file?.url)

  return (
    <>
      <amp-video
        controls
        autoplay="autoplay"
        loop="loop"
        layout="responsive"
        width="100vw"
        height="50vw"
      >
        {urlOriginalType && (
          <source src={video?.urlOriginal} type={`video/${urlOriginalType}`} />
        )}
        {fileUrlType && (
          <source src={video?.file?.url} type={`video/${fileUrlType}`} />
        )}
      </amp-video>
    </>
  )
}
