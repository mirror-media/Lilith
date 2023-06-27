import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import AmpAudioBlock from './amp/amp-audio-block'
import { defaultMarginBottom, defaultMarginTop } from '../shared-style'
const AudioWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: start;
  flex-direction: column;
  ${defaultMarginTop}
  ${defaultMarginBottom}
  ${({ theme }) => theme.breakpoint.md} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
  }
`
const AudioName = styled.p`
  color: #979797;
  font-size: 14px;
  line-height: 2;
  font-weight: 500;
`
const Audio = styled.audio`
  width: 100%;
  max-width: 300px;
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

type AudioEntity = {
  id: string
  name?: string
  urlOriginal?: string
  file?: {
    url: string
  }
  heroImage?: ImageEntity
}

export function AudioBlock(entity: DraftEntityInstance, contentLayout: string) {
  const isAmp = contentLayout === 'amp'
  const { audio }: { audio: AudioEntity } = entity.getData()

  const AudioJsx = isAmp ? (
    <AmpAudioBlock audio={audio} />
  ) : (
    <Audio controls>
      <source src={audio?.urlOriginal} />
      <source src={audio?.file?.url} />
    </Audio>
  )

  return (
    <AudioWrapper>
      <AudioName>{audio?.name}</AudioName>
      {AudioJsx}
    </AudioWrapper>
  )
}
