import React from 'react'
import styled from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import defaultImage from '../assets/default-og-img.png'
import loadingImage from '../assets/loading.gif'
import CustomImage from '@readr-media/react-image'

const Figure = styled.figure`
  margin-block: unset;
  margin-inline: unset;
  margin-top: 20px;
  margin-bottom: 20px;
`
const Figcaption = styled.figcaption`
  font-size: 14px;
  line-height: 1.8;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 12px;
  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 20px;
  }
`
const Anchor = styled.a`
  text-decoration: none;
`

export function ImageBlock(entity: DraftEntityInstance) {
  const { name, desc, resized, url } = entity.getData()
  let imgBlock = (
    <Figure>
      <CustomImage
        images={resized}
        defaultImage={defaultImage}
        loadingImage={loadingImage}
        alt={name}
        rwd={{ mobile: '100vw', tablet: '640px', default: '100%' }}
        priority={true}
      ></CustomImage>
      {desc ? <Figcaption>{desc}</Figcaption> : null}
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
