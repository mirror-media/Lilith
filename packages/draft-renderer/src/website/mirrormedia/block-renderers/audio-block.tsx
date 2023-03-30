import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

const AudioWrapper = styled.div`
  display: flex;
  gap: 20px;
`
const Audio = styled.audio``

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

export function AudioBlock(entity: DraftEntityInstance) {
  const { audio }: { audio: AudioEntity } = entity.getData()

  return (
    <AudioWrapper>
      <p>{audio?.name}</p>
      <Audio controls>
        <source src={audio?.urlOriginal} />
        <source src={audio?.file?.url} />
      </Audio>
    </AudioWrapper>
  )
}
