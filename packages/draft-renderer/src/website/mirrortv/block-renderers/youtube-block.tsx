import React from 'react'
import styled from 'styled-components'
import { EntityInstance } from 'draft-js'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
import { ContentLayout } from '../types'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'amp-youtube': any
      'amp-img': any
    }
  }
}

const YoutubeRenderWrapper = styled.div`
  ${defaultMarginTop}
  ${defaultMarginBottom}
`

const IframeWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; // 保持 16:9 比例
  overflow: hidden;
  background-color: #000;
`
const Iframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Caption = styled.div`
  line-height: 1.43;
  letter-spacing: 0.4px;
  font-size: 14px;
  color: #808080;
  padding: 15px 15px 0 15px;
`

/**
 * 處理 YouTube ID 的輔助函式 (抽出至組件外，避免重複宣告)
 */
function handleYoutubeId(urlOrId = '') {
  if (!urlOrId) return ''
  const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/|^)([a-zA-Z0-9_-]{11})/i
  const matches = urlOrId.match(youtubeIdRegex)
  return matches ? matches[1] : urlOrId
}

export function YoutubeBlock(
  entity: EntityInstance,
  contentLayout: ContentLayout
) {
  const isAmp = contentLayout === 'amp'
  const { youtubeId: rawId, description } = entity.getData()
  const youtubeId = handleYoutubeId(rawId)

  if (!youtubeId) return null

  // --- AMP 渲染邏輯 ---
  const ampYoutubeIframe = (
    <amp-youtube 
      data-videoid={youtubeId} 
      layout="responsive" 
      width="16" 
      height="9"
    >
      <amp-img
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        placeholder="placeholder"
        layout="fill"
      />
    </amp-youtube>
  )

  // --- Web 渲染邏輯 ---
  const youtubeIframe = (
    <IframeWrapper>
      <Iframe
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
        loading="lazy"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={description || 'YouTube video player'}
      />
    </IframeWrapper>
  )

  return (
    <YoutubeRenderWrapper>
      {isAmp ? ampYoutubeIframe : youtubeIframe}
      {description && <Caption>{description}</Caption>}
    </YoutubeRenderWrapper>
  )
}