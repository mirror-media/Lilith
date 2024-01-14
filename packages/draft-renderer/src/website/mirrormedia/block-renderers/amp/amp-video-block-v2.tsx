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
  videoSrc: string
  youtubeUrl?: string
  file: {
    filename?: string
    filesize: number
    url: string
  }
  heroImage: ImageEntity
}
/**
 * //After 202310, video which only contain property `videoSrc`, and property `urlOriginal` is an empty string.
 */
export default function AmpVideoBlockV2({ video }: { video: VideoEntity }) {
  const videoSrcType = extractFileExtension(video?.videoSrc)
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
        {videoSrcType && (
          <source src={video?.videoSrc} type={`video/${videoSrcType}`} />
        )}
        {fileUrlType && (
          <source src={video?.file?.url} type={`video/${fileUrlType}`} />
        )}
      </amp-video>
    </>
  )
}
