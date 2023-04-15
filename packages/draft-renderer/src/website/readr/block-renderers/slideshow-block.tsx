import { EntityInstance } from 'draft-js'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import ArrowDown from '../assets/arrow-down.svg'
import ArrowTop from '../assets/arrow-top.svg'
import Cross from '../assets/cross.svg'
import { LightBoxImage } from '../types/block'

type SlodeshowProps = {
  expand?: boolean
}

// slideshow
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

// lightbox
type LightboxProps = {
  focusNumber?: number
  length?: number
  focus?: boolean
}

const LightBoxWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.breakpoint.xl} {
    display: block;
    background: #000928;
    width: 100%;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    color: white;
    padding: 0 72px 0 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 9999;
  }
`

const ButtonWrapper = styled.div`
  height: 480px;
  display: flex;
  align-items: flex-start;
  justify-content: center;

  svg {
    opacity: 0.66;
    cursor: pointer;
    transform: translateY(-64px);
  }

  &:hover svg {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }
`

const ContentTable = styled.div<LightboxProps>`
  width: 64px;

  .sidebar-images {
    margin: 15px auto;
    overflow-y: scroll;
    max-height: 520px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none; /* for Chrome, Safari, and Opera */
    }
  }

  svg {
    opacity: 0.66;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
    }
  }

  .arrow-top {
    visibility: ${(props) => (props.focusNumber === 0 ? 'hidden' : 'visible')};
  }

  .arrow-down {
    visibility: ${(props) =>
      props.focusNumber === (props.length ?? 0) - 1 ? 'hidden' : 'visible'};
  }
`

const SlideImage = styled.div<LightboxProps>`
  width: 100%;
  aspect-ratio: 1/1;
  margin-bottom: 12px;

  img {
    height: 100%;
    object-fit: cover;
    display: inline-block;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    cursor: pointer;
    filter: ${(props) => (props.focus ? 'none' : 'brightness(35%)')};

    &:hover {
      filter: ${(props) => (props.focus ? 'none' : 'brightness(60%)')};
    }
  }
`
const FocusImage = styled.figure`
  max-width: 800px;
  max-height: 480px;
  overflow: hidden;

  img {
    object-fit: cover;
    object-position: center;
  }

  ${({ theme }) => theme.breakpoint.xxl} {
    max-width: 960px;
  }
`

const ImageWrapper = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 23px;
  text-align: center;
  color: #ffffff;

  .description {
    max-height: 46px;
    overflow: hidden;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    opacity: 0.66;
    margin-top: 32px;
  }

  .number {
    opacity: 0.5;
    margin-top: 12px;
  }
`

// 202206 latest version of slideshow, support delay property
export function SlideshowBlockV2(entity: EntityInstance) {
  const { images } = entity.getData()
  const [expand, setExpand] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [focusNumber, setFocusNumber] = useState(0)

  const imagesRefs = useRef(Array(images.length).fill(null))

  // useEffect(() => {
  //   if (imagesRefs) {
  //     /* @ts-ignore */
  //     imagesRefs.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'center',
  //     })
  //   }
  // }, [focusNumber])

  //lightbox sidebar-images
  const sideBarImages = images.map((image: LightBoxImage, index: number) => {
    return (
      <SlideImage
        key={image.id}
        focus={focusNumber === index}
        onClick={() => {
          setFocusNumber(index)
          /* @ts-ignore */
          imagesRefs.current[index].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }}
        /* @ts-ignore */
        ref={(el) => (imagesRefs.current[index] = el)}
      >
        <img
          /* @ts-ignore */
          src={image.resized?.original}
          alt={image.name}
          /* @ts-ignore */
          onError={(e) => (e.currentTarget.src = image.imageFile?.url)}
        />
      </SlideImage>
    )
  })

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
        <LightBoxWrapper>
          <ContentTable focusNumber={focusNumber} length={images.length}>
            <ArrowTop
              className="arrow-top"
              onClick={() => {
                if (focusNumber > 0) {
                  setFocusNumber(focusNumber - 1)
                  /* @ts-ignore */
                  imagesRefs.current[focusNumber - 1].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  })
                }
              }}
            />

            <div className="sidebar-images">{sideBarImages}</div>

            <ArrowDown
              className="arrow-down"
              onClick={() => {
                if (focusNumber < images.length - 1) {
                  setFocusNumber(focusNumber + 1)
                  /* @ts-ignore */
                  imagesRefs.current[focusNumber + 1].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  })
                }
              }}
            />
          </ContentTable>

          <ImageWrapper>
            <FocusImage>
              <img
                /* @ts-ignore */
                src={images[focusNumber].resized?.original}
                alt={images[focusNumber].name}
                onError={(e) =>
                  /* @ts-ignore */
                  (e.currentTarget.src = images[focusNumber].imageFile?.url)
                }
              />
            </FocusImage>
            <div className="description">{images[focusNumber].desc}</div>
            <p className="number">
              {focusNumber + 1} / {images.length}
            </p>
          </ImageWrapper>
          <ButtonWrapper
            onClick={() => setLightbox(false)}
            className="cross-button"
          >
            <Cross />
          </ButtonWrapper>
        </LightBoxWrapper>
      )}
    </>
  )
}
