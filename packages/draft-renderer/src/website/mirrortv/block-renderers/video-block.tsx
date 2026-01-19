import React from 'react'
import styled from 'styled-components'
import { EntityInstance } from 'draft-js'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
import AmpVideoBlock from './amp/amp-video-block'
import AmpVideoBlockV2 from './amp/amp-video-block-v2'
import { ContentLayout } from '../types'

// --- Styled Components ---
const VideoWrapper = styled.div`
  ${defaultMarginTop}
  ${defaultMarginBottom}
`

const Video = styled.video`
  display: block;
  width: 100%;
  background-color: #000;
`

const Description = styled.div`
  line-height: 1.43;
  letter-spacing: 0.4px;
  font-size: 14px;
  color: #808080;
  padding: 15px 15px 0 15px;
`

const YoutubeResponsiveWrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
`

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
  videoSrc: string
  youtubeUrl?: string
  file: {
    filename?: string
    filesize: number
    url: string
  }
  heroImage: ImageEntity
}

// --- Utils ---
const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
};

const getVideoPoster = (heroImage: ImageEntity) => {
  if (!heroImage) return undefined
  return (
    heroImage.resized?.w1200 ||
    heroImage.resized?.original ||
    heroImage.file?.url
  )
}

/**
 * Before 202310
 */
export function VideoBlock(
  entity: EntityInstance,
  contentLayout: ContentLayout
) {
  const isAmp = contentLayout === 'amp'
  const { video }: { video: VideoEntity } = entity.getData()
  const poster = getVideoPoster(video?.heroImage)

  const videoUrl = video?.urlOriginal || video?.file?.url || ''
  const youtubeId = getYoutubeId(videoUrl)

  if (isAmp) return <AmpVideoBlock video={video} />

  return (
    <VideoWrapper>
      {youtubeId ? (
        <YoutubeResponsiveWrapper>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video?.name || 'YouTube Video'}
          />
        </YoutubeResponsiveWrapper>
      ) : (
        /* 原生影片加上 key 與屬性優化 */
        <Video 
          key={videoUrl} // 重要：網址變動時強制重新載入組件
          muted 
          autoPlay 
          loop 
          controls 
          poster={poster} 
          playsInline
          preload="metadata"
        >
          {videoUrl && <source src={videoUrl} />}
        </Video>
      )}
    </VideoWrapper>
  )
}

/**
 * After 202310
 */
export function VideoBlockV2(
  entity: EntityInstance,
  contentLayout: ContentLayout
) {
  const isAmp = contentLayout === 'amp'
  const { video, desc }: { video: VideoEntity; desc: string } = entity.getData()
  const poster = getVideoPoster(video?.heroImage)

  const videoUrl = video?.videoSrc || video?.file?.url || ''
  const youtubeId = getYoutubeId(videoUrl)

  if (isAmp) return <AmpVideoBlockV2 video={video} />

  return (
    <VideoWrapper>
      {youtubeId ? (
        <YoutubeResponsiveWrapper>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video?.name || 'YouTube Video'}
          />
        </YoutubeResponsiveWrapper>
      ) : videoUrl ? (
        <Video 
          key={videoUrl}
          muted 
          autoPlay 
          loop 
          controls 
          poster={poster} 
          playsInline
          preload="metadata"
        >
          <source src={videoUrl} />
        </Video>
      ) : null}
      
      {desc && <Description>{desc}</Description>}
    </VideoWrapper>
  )
}