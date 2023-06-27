import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'

const YoutubeRenderWrapper = styled.div`
  ${defaultMarginTop}
  ${defaultMarginBottom}
`

const IframeWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
`
const Iframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
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

export function YoutubeBlock(entity: DraftEntityInstance) {
  const { youtubeId, description } = entity.getData()

  const youtubeIframe = youtubeId ? (
    <IframeWrapper>
      <Iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        loading="lazy"
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </IframeWrapper>
  ) : null

  return (
    <YoutubeRenderWrapper>
      {youtubeIframe}
      {description && <Caption>{description}</Caption>}
    </YoutubeRenderWrapper>
  )
}
