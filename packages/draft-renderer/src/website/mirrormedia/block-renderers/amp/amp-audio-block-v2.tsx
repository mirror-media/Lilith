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
  audioSrc?: string
  file?: {
    url: string
  }
  heroImage?: ImageEntity
}

/**
 * After 202310, audio which only contain property `audioSrc`, and property `urlOriginal` is an empty string.
 */
export default function AmpAudioBlockV2({ audio }: { audio: AudioEntity }) {
  const audioSrcType = extractFileExtension(audio?.audioSrc)
  const fileUrlType = extractFileExtension(audio?.file?.url)
  return (
    <amp-audio width="50vw" height="54">
      {audioSrcType && (
        <source type={`audio/${audioSrcType}`} src={audio?.audioSrc} />
      )}
      {fileUrlType && (
        <source type={`audio/${fileUrlType}`} src={audio?.file?.url} />
      )}
    </amp-audio>
  )
}
