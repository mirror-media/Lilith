import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

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
      <Image
        src={resized?.w800}
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
