import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import img from '../assets/default-og-img.png'
const Image = styled.img`
  width: 100%;
`

const Figure = styled.figure`
  margin-block: unset;
  margin-inline: unset;
  margin: 0 10px;
`

const Anchor = styled.a`
  text-decoration: none;
`

export function ImageBlock(entity: DraftEntityInstance) {
  const { desc, imageFile, resized, url } = entity.getData()

  let imgBlock = (
    <Figure>
      <img src={img}></img>
      <Image
        src={resized?.original}
        onError={(e) => (e.currentTarget.src = imageFile?.url)}
      />
      <figcaption>{desc}</figcaption>
    </Figure>
  )

  if (url) {
    imgBlock = (
      <Anchor href={url} target="_blank">
        {imgBlock}
      </Anchor>
    )
  }

  return imgBlock
}
