import CustomImage from '@readr-media/react-image'
import { DraftEntityInstance } from 'draft-js'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import defaultImage from '../assets/default-og-img.png'
import arrowDown from '../assets/slideshow-arrow-down-dark.png'
import SlideShowLightBox from '../components/slideshow-lightbox'

const SlideShowDesktopSize = 960
const SpacingBetweenSlideImages = 12

const SlideShowBlockWrapper = styled.div`
  width: calc(100% + 40px);
  transform: translateX(-20px);
  position: relative;
  ${({ theme }) => theme.margin.default};

  ${({ theme }) => theme.breakpoint.xl} {
    width: ${SlideShowDesktopSize}px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    transform: translateX(-180px);
    gap: ${SpacingBetweenSlideImages}px;
    max-height: ${(props) => (props.expandSlideShow ? 'none' : '960px')};
    overflow: ${(props) => (props.expandSlideShow ? 'visible' : 'hidden')};
    margin-bottom: ${(props) => (props.expandSlideShow ? '32px' : '16px')};
  }

  .slideshow-image {
    max-height: ${(props) =>
      props.shouldLimitFigureHeight ? 'calc(960px - 324px)' : 'none'};
  }
`

const SlideShowImage = styled.figure`
  width: 100%;
  aspect-ratio: 1/1;

  & + .slideshow-image {
    margin-top: ${SpacingBetweenSlideImages}px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    flex: 1 0 calc((100% - ${SpacingBetweenSlideImages * 2}px) / 3);
    min-width: ${SlideShowDesktopSize / 3 - 8}px;

    &:hover {
      cursor: pointer;
      filter: brightness(15%);
      transition: 0.3s;
    }

    & + .slideshow-image {
      margin-top: unset;
    }
  }
`

const FigCaption = styled.figcaption`
  font-weight: 400;
  line-height: 23px;
  color: #000928;
  opacity: 0.5;
  ${({ theme }) => theme.fontSize.xs};
  padding: 8px 20px 20px 20px;

  ${({ theme }) => theme.breakpoint.md} {
    ${({ theme }) => theme.fontSize.sm};
  }

  ${({ theme }) => theme.breakpoint.xl} {
    display: none;
  }
`

const GradientMask = styled.div`
  display: none;

  ${({ theme }) => theme.breakpoint.xl} {
    cursor: pointer;
    display: block;
    position: absolute;
    width: 100%;
    height: ${SlideShowDesktopSize}px;
    bottom: 0;
    left: 0;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 648px,
      rgba(255, 255, 255, 1) 960px
    );
  }
`

const ExpandText = styled.div`
  display: none;

  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
    font-style: normal;
    font-weight: 700;
    ${({ theme }) => theme.fontSize.md};
    line-height: 18px;
    letter-spacing: 0.03em;
    color: #000928;
    text-align: center;
    cursor: pointer;
    position: relative;
    margin-bottom: 48px;
    transition: all 0.2s ease;

    &:hover::after,
    &:active::after {
      bottom: -30px;
      transition: all 0.2s;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -26px;
      left: 50%;
      transform: translate(-50%, 0%);
      width: 14px;
      height: 13px;
      background-image: url(${arrowDown});
      background-repeat: no-repeat;
      background-position: center center;
      background-size: 14px;
    }
  }
`

// support old version of slideshow without delay propertiy
const Figure = styled.figure`
  position: relative;
  margin-block: unset;
  margin-inline: unset;
  margin: 0 10px;
`

const Image = styled.img`
  width: 100%;
`

export function SlideshowBlock(entity: DraftEntityInstance) {
  const images = entity.getData()
  return (
    <Figure>
      <Image
        src={images?.[0]?.resized?.original}
        alt={images?.[0]?.name}
        onError={(e) => (e.currentTarget.src = images?.[0]?.imageFile?.url)}
      />
    </Figure>
  )
}

// 202206 latest version of slideshow, support delay property
export function SlideshowBlockV2(entity: DraftEntityInstance) {
  const { images } = entity.getData()
  const [expandSlideShow, setExpandSlideShow] = useState(false)
  const [showLightBox, setShowLightBox] = useState(false)
  const [focusImageIndex, setFocusImageIndex] = useState(0)

  const imagesRefs = useRef(Array(images.length).fill(null))

  useEffect(() => {
    const focusedImageRef = imagesRefs?.current[focusImageIndex]

    if (focusedImageRef) {
      focusedImageRef?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [focusImageIndex])

  const shouldMaskSlideShow = Boolean(images.length > 9 && !expandSlideShow)
  const shouldLimitFigureHeight = Boolean(images.length > 1)

  const slideShowImages = images.map((image, index) => {
    const { id, resized, desc, name } = image
    return (
      <SlideShowImage
        className="slideshow-image"
        key={id}
        onClick={() => {
          setShowLightBox(!showLightBox)
          setFocusImageIndex(index)
        }}
      >
        <CustomImage
          images={resized}
          defaultImage={defaultImage}
          alt={name}
          rwd={{
            mobile: '100vw',
            tablet: '608px',
            desktop: '960px',
            default: '100%',
          }}
          priority={true}
        />
        {desc && <FigCaption>{desc}</FigCaption>}
      </SlideShowImage>
    )
  })

  return (
    <>
      <SlideShowBlockWrapper
        onClick={() => setExpandSlideShow(!expandSlideShow)}
        expandSlideShow={expandSlideShow}
        shouldLimitFigureHeight={shouldLimitFigureHeight}
      >
        {slideShowImages}
        {shouldMaskSlideShow && <GradientMask />}
      </SlideShowBlockWrapper>

      {shouldMaskSlideShow && (
        <ExpandText
          className="slideshow-expand-text"
          onClick={() => setExpandSlideShow(!expandSlideShow)}
        >
          展開所有圖片
        </ExpandText>
      )}
      {showLightBox && (
        <SlideShowLightBox
          focusImageIndex={focusImageIndex}
          images={images}
          setShowLightBox={setShowLightBox}
          setFocusImageIndex={setFocusImageIndex}
          imagesRefs={imagesRefs}
        />
      )}
    </>
  )
}
