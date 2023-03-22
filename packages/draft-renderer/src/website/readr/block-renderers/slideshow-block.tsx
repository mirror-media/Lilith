import { EntityInstance } from 'draft-js'
import React, { useState } from 'react'
import styled from 'styled-components'

import LightBox from '../components/slideshow-lightbox'

interface SlodeshowProps {
  expand?: boolean
}

const SliderWrapper = styled.div<SlodeshowProps>`
  width: calc(100% + 40px);
  transform: translateX(-20px);
  position: relative;

  ${({ theme }) => theme.breakpoint.xl} {
    width: 960px;
    max-height: ${(props) => (props.expand ? 'none' : '960px')};
    overflow: ${(props) => (props.expand ? 'visible' : 'hidden')};
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    transform: translateX(-180px);
    cursor: pointer;
  }
`

const Image = styled.div`
  width: 100%;
  aspect-ratio: 1/1;

  img {
    height: 100%;
    object-fit: cover;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    width: 312px;
  }
`

const SlideshowCount = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 100%;
  border: black 1px solid;
  transform: translate(-50%, -50%);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  aspect-ratio: 1;
  min-height: 66px;
  padding: 10px;
`

const Figure = styled.figure`
  margin-bottom: 12px;
  cursor: pointer;

  &:hover img {
    filter: brightness(15%);
    transition: 0.3s;
  }
`

const FigCaption = styled.figcaption`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 23px;
  color: #000928;
  opacity: 0.5;
  display: block;
  padding: 8px 20px 20px 20px;

  ${({ theme }) => theme.breakpoint.md} {
    font-size: 16px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`

const GradientMask = styled.div`
  display: none;
  ${({ theme }) => theme.breakpoint.xl} {
    position: absolute;
    width: 100%;
    height: 960px;
    bottom: 0;
    left: 0;
    display: block;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 648px,
      rgba(255, 255, 255, 1) 960px
    );
  }
`

//to check when screen-size < 1200, <Figure> can't onClick and show LightBox
const CoverMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: block;

  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`

const ExpandText = styled.div`
  display: none;
  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
    font-style: normal;
    font-weight: 700;
    font-size: 18px;
    line-height: 18px;
    letter-spacing: 0.03em;
    color: #000928;
    margin-top: 16px;
    text-align: center;
    cursor: pointer;
  }
`

// support old version of slideshow without delay propertiy
export function SlideshowBlock(entity: EntityInstance) {
  const images = entity.getData()
  return (
    <Figure>
      <Image
        /* @ts-ignore */
        src={images?.[0]?.resized?.original}
        /* @ts-ignore */
        onError={(e) => (e.currentTarget.src = images?.[0]?.imageFile?.url)}
      />
      <SlideshowCount>+{images.length}</SlideshowCount>
    </Figure>
  )
}

// 202206 latest version of slideshow, support delay property
export function SlideshowBlockV2(entity: EntityInstance) {
  const { images, delay } = entity.getData()
  const [expand, setExpand] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [focusNumber, setFocusNumber] = useState(0)

  // TODO: 使用 react-image ?
  return (
    <>
      <SliderWrapper onClick={() => setExpand(!expand)} expand={expand}>
        <CoverMask />
        {images.map((image: any, index: number) => {
          return (
            <Figure
              key={image.id}
              onClick={() => {
                setLightbox(!lightbox)
                setFocusNumber(index)
              }}
            >
              <Image>
                <img
                  src={image.resized?.original}
                  alt={image.name}
                  onError={(e) => (e.currentTarget.src = image.imageFile?.url)}
                />
              </Image>
              <FigCaption>{image.desc}</FigCaption>
            </Figure>
          )
        })}
        {images.length > 9 && !expand && <GradientMask />}
      </SliderWrapper>
      {images.length > 9 && !expand && (
        <ExpandText onClick={() => setExpand(!expand)}>展開所有圖片</ExpandText>
      )}
      {lightbox && (
        <LightBox
          images={images}
          setLightbox={setLightbox}
          focusNumber={focusNumber}
          setFocusNumber={setFocusNumber}
        />
      )}
    </>
  )
}
