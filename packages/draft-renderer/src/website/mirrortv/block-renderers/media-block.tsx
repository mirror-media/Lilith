import React from 'react'
import { DraftEntityInstance } from 'draft-js'

const styles = {
  media: {
    width: '100%',
  },
}

const Audio = (props) => {
  return <audio controls src={props.src} style={styles.media} />
}

const Image = (props) => {
  return <img src={props.src} style={styles.media} />
}

const Video = (props) => {
  return <video controls src={props.src} style={styles.media} />
}

export const MediaBlock = (entity: DraftEntityInstance) => {
  const { src } = entity.getData()
  const type = entity.getType()

  let media
  if (type === 'audioLink') {
    media = <Audio src={src} />
  } else if (type === 'imageLink') {
    media = <Image src={src} />
  } else if (type === 'videoLink') {
    media = <Video src={src} />
  }

  return media
}
