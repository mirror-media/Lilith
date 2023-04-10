import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

const AudioWrapper = styled.div`
  display: flex;
  gap: 20px;
`
const Audio = styled.audio``

type AudioEntity = {
  id: string
  name?: string
  url?: string
  file?: {
    url: string
  }
}

export function AudioBlock(entity: DraftEntityInstance) {
  const { audio }: { audio: AudioEntity } = entity.getData()

  return (
    <AudioWrapper>
      <p>{audio?.name}</p>
      <Audio controls>
        <source src={audio?.url} />
        <source src={audio?.file?.url} />
      </Audio>
    </AudioWrapper>
  )
}
