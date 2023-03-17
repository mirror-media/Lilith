import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'

const Figure = styled.figure`
  width: calc(100% + 40px);
  transform: translateX(-20px);
`

const Image = styled.img`
  width: 100%;
`

const FigureCaption = styled.figcaption`
  width: 100%;
  font-size: 14px;
  line-height: 21px;
  text-align: justify;
  color: rgba(0, 9, 40, 0.5);
  padding: 0 20px;
  margin: 8px 0 0;

  ${({ theme }) => theme.breakpoint.xl} {
    font-size: 16px;
    line-height: 24px;
  }
`
const Anchor = styled.a`
  text-decoration: none;
`

export function ImageBlock(entity: DraftEntityInstance) {
  const { desc, imageFile, resized, url } = entity.getData()

  let imgBlock = (
    <Figure>
      <Image
        src={resized?.original}
        onError={(e) => (e.currentTarget.src = imageFile?.url)}
      />
      <FigureCaption>{desc}</FigureCaption>
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
