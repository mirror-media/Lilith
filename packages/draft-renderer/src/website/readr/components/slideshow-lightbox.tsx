import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import ArrowDown from '../assets/arrow-down.svg'
import ArrowTop from '../assets/arrow-top.svg'
import Cross from '../assets/cross.svg'
import { Image } from '../types/block'

interface LightboxProps {
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

  .slides {
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

interface SlideshowLightBoxProps {
  images: Image[]
  setLightbox: (value: boolean) => void
  focusNumber: number
  setFocusNumber: (value: number) => void
}

export default function SlideshowLightBox({
  images,
  setLightbox,
  focusNumber,
  setFocusNumber,
}: SlideshowLightBoxProps) {
  const imagesRefs = useRef(Array(images.length).fill(null))

  useEffect(() => {
    /* @ts-ignore */
    imagesRefs.current[focusNumber].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [focusNumber])

  return (
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

        <div className="slides">
          {images.map((image, index: number) => {
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
          })}
        </div>

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
  )
}
