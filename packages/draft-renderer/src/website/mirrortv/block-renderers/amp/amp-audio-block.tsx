import React from 'react'
import { extractFileExtension } from '../../utils'

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

/**
 * Before 202310, audio which contain property `urlOriginal` and not contain property `audioSrc`.
 */
export default function AmpAudioBlock({ audio }: { audio: AudioEntity }) {
  const urlOriginalType = extractFileExtension(audio?.urlOriginal)
  const fileUrlType = extractFileExtension(audio?.file?.url)
  return (
    <amp-audio width="50vw" height="54">
      {urlOriginalType && (
        <source type={`audio/${urlOriginalType}`} src={audio?.urlOriginal} />
      )}
      {fileUrlType && (
        <source type={`audio/${fileUrlType}`} src={audio?.file?.url} />
      )}
    </amp-audio>
  )
}
