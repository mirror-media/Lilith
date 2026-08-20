import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

const Wrapper = styled.div`
  margin: 32px 0;
`

const IframeWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
`

const Iframe = styled.iframe`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`

const Caption = styled.div`
  line-height: 1.43;
  letter-spacing: 0.4px;
  font-size: 14px;
  color: #808080;
  padding: 15px 15px 0;
`

export function YoutubeBlock(entity: DraftEntityInstance) {
  const { youtubeId, description } = entity.getData()
  const match =
    typeof youtubeId === 'string' && youtubeId.match(/[a-zA-Z0-9_-]{11}/)
  const id = match?.[0]
  if (!id) return null

  return (
    <Wrapper>
      <IframeWrapper>
        <Iframe
          src={`https://www.youtube.com/embed/${id}`}
          loading="lazy"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </IframeWrapper>
      {description && <Caption>{description}</Caption>}
    </Wrapper>
  )
}
