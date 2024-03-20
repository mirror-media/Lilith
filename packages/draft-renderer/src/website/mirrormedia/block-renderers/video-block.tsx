import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
import AmpVideoBlock from './amp/amp-video-block'
import AmpVideoBlockV2 from './amp/amp-video-block-v2'
import { ContentLayout } from '../types'

const VideoWrapper = styled.div`
  ${defaultMarginTop}
  ${defaultMarginBottom}
`

const Video = styled.video`
  display: block;
  width: 100%;
`

const Description = styled.div`
  line-height: 1.43;
  letter-spacing: 0.4px;
  font-size: 14px;
  color: #808080;
  padding: 15px 15px 0 15px;
`

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
 * Before 202310, video which contain property `urlOriginal` and not contain property `videoSrc`.
 */
export function VideoBlock(
  entity: DraftEntityInstance,
  contentLayout: ContentLayout
) {
  const isAmp = contentLayout === 'amp'
  const { video }: { video: VideoEntity } = entity.getData()

  if (isAmp) {
    return <AmpVideoBlock video={video} />
  }

  return (
    <>
      <Video muted autoPlay loop controls>
        <source src={video?.urlOriginal} />
        <source src={video?.file?.url} />
      </Video>
    </>
  )
}

/**
 * After 202310, video which only contain property `videoSrc`, and property `urlOriginal` is an empty string.
 */
export function VideoBlockV2(
  entity: DraftEntityInstance,
  contentLayout: string
) {
  const isAmp = contentLayout === 'amp'
  const { video, desc }: { video: VideoEntity; desc: string } = entity.getData()

  if (isAmp) {
    return <AmpVideoBlockV2 video={video} />
  }

  return (
    <VideoWrapper>
      <Video muted autoPlay loop controls>
        <source src={video?.videoSrc} />
        <source src={video?.file?.url} />
      </Video>
      {desc && <Description>{desc}</Description>}
    </VideoWrapper>
  )
}
