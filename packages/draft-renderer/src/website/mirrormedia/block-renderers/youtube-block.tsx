import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
import { ContentLayout } from '../types'

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

export function YoutubeBlock(
  entity: DraftEntityInstance,
  contentLayout: ContentLayout
) {
  const isAmp = contentLayout === 'amp'
  const { youtubeId, description } = entity.getData()

  function handleYoutubeId(urlOrId = '') {
    // 使用正規表達式檢查可能的 YouTube ID 格式
    const youtubeIdRegex = /^(?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=|https?:\/\/youtu.be\/|\/id\/)?([a-zA-Z0-9_-]{11})/i

    const matches = urlOrId.startsWith('/')
      ? urlOrId.replace('/', '').match(youtubeIdRegex)
      : urlOrId.match(youtubeIdRegex)

    if (matches && matches[1]) {
      return matches[1]
    }

    return ''
  }

  const ampYoutubeIframe = youtubeId ? (
    <IframeWrapper>
      <amp-youtube data-videoid={handleYoutubeId(youtubeId)} layout="fill">
        <amp-img
          src={`https://i.ytimg.com/vi/${handleYoutubeId(
            youtubeId
          )}/hqdefault.jpg`}
          placeholder
          layout="fill"
        />
      </amp-youtube>
    </IframeWrapper>
  ) : null

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
      {isAmp ? ampYoutubeIframe : youtubeIframe}
      {description && <Caption>{description}</Caption>}
    </YoutubeRenderWrapper>
  )
}
