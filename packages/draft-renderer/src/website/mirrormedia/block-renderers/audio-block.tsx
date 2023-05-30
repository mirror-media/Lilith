import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import { extractFileExtension } from '../utils'

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

export function AudioBlock(entity: DraftEntityInstance, contentLayout: string) {
  const isAmp = contentLayout === 'amp'
  const { audio }: { audio: AudioEntity } = entity.getData()

  return (
    <AudioWrapper>
      <p>{audio?.name}</p>
      {isAmp ? (
        <amp-audio width="50vw" height="54">
          {audio?.urlOriginal && (
            <source
              type={`audio/${extractFileExtension(audio?.urlOriginal)}`}
              src={audio?.urlOriginal}
            />
          )}
          {audio?.file?.url && (
            <source
              type={`audio/${extractFileExtension(audio?.file?.url)}`}
              src={audio?.file?.url}
            />
          )}
        </amp-audio>
      ) : (
        <Audio controls>
          <source src={audio?.urlOriginal} />
          <source src={audio?.file?.url} />
        </Audio>
      )}
    </AudioWrapper>
  )
}
