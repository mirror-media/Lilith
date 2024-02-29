import { ContentBlock, ContentState } from 'draft-js'
import React from 'react'
import styled from 'styled-components'
import CustomImage from '@readr-media/react-image'
import defaultImage from '../assets/default-og-img.png'

const Figure = styled.figure`
  width: calc(100% + 40px);
  transform: translateX(-20px);
  ${({ theme }) => theme.margin.default};
`

const FigureCaption = styled.figcaption`
  width: 100%;
  ${({ theme }) => theme.fontSize.xs}
  line-height: 20px;
  text-align: justify;
  color: rgba(0, 9, 40, 0.5);
  padding: 0 20px;
  margin: 8px 0 0;

  ${({ theme }) => theme.breakpoint.xl} {
    line-height: 24px;
    ${({ theme }) => theme.fontSize.sm};
  }
`
const Anchor = styled.a`
  text-decoration: none;
`

type ImageBlockProps = {
  block: ContentBlock
  contentState: ContentState
}

export function ImageBlock(props: ImageBlockProps) {
  const { block, contentState } = props
  const entityKey = block.getEntityAt(0)

  const entity = contentState.getEntity(entityKey)
  const { desc, name, resized = {}, resizedWebp = {}, url } = entity.getData()

  let imgBlock = (
    <Figure>
      <CustomImage
        images={resized}
        imagesWebP={resizedWebp}
        defaultImage={defaultImage}
        alt={name}
        rwd={{
          mobile: '100vw',
          tablet: '608px',
          desktop: '640px',
          default: '100%',
        }}
        priority={true}
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
