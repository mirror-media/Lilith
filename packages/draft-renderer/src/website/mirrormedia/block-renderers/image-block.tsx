import React, { useState, useEffect, useRef } from 'react'
import styled, { css } from 'styled-components'
import { DraftEntityInstance } from 'draft-js'
import defaultImage from '../assets/default-og-img.png'
import loadingImage from '../assets/loading.gif'
import CustomImage from '@readr-media/react-image'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock'

const imageFigureLayoutNormal = css`
  .readr-media-react-image {
    width: 100%;
  }
`
const imageFigureLayoutWide = css`
  .readr-media-react-image {
    position: relative;
    max-width: calc(100% + 20px + 20px);
    width: 100vw;
    transform: translateX(-20px);
    @media (min-width: 680px) {
      max-width: 100%;
      transform: translateX(0px);
    }
  }
`
const imageFigureLayoutPremium = css`
  .readr-media-react-image {
    position: relative;
    max-width: calc(100% + 20px + 20px);
    width: 100vw;
    transform: translateX(-20px);
    @media (min-width: 680px) {
      max-width: 100%;
      transform: translateX(0px);
    }
  }
`

const figcaptionLayoutNormal = css`
  margin-top: 12px;
  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 20px;
  }
`
const figcaptionLayoutWide = css`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  padding-top: 12px;
  margin-top: 16px;
  position: relative;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`

const Figure = styled.figure`
  /* margin-block: unset; */
  /* margin-inline: unset; */
  ${defaultMarginTop}
  ${defaultMarginBottom}
  .readr-media-react-image {
    cursor: pointer;
  }
`
const ImageFigure = styled(Figure)`
  ${({ contentLayout }) => {
    switch (contentLayout) {
      case 'normal':
        return imageFigureLayoutNormal
      case 'wide':
        return imageFigureLayoutWide
      case 'premium':
        return imageFigureLayoutPremium
      default:
        return imageFigureLayoutNormal
    }
  }}
`
const Figcaption = styled.figcaption`
  font-size: 14px;
  line-height: 1.8;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.5);
  ${({ contentLayout }) => {
    switch (contentLayout) {
      case 'normal':
        return figcaptionLayoutNormal
      case 'wide':
        return figcaptionLayoutWide
      default:
        return figcaptionLayoutNormal
    }
  }}
`
const Anchor = styled.a`
  text-decoration: none;
`
const LightBoxWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 819;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;

  button {
    width: 36px;
    height: 36px;
    padding: 4px;
    display: flex;
    position: absolute;
    top: 0px;
    right: 0px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &:focus {
      outline: none;
    }
    .close {
      border-radius: 50%;
      height: 20px;
      width: 20px;
      margin: 0 5px 0 0;
      position: relative;
      &:before,
      :after {
        position: absolute;
        left: 8.5px;
        top: 5px;
        transform: translate(-50%, -50%);
        content: ' ';
        height: 25.5px;
        width: 1.2px;
        background-color: #fff;
      }
      &:before {
        transform: rotate(45deg);
      }
      &:after {
        transform: rotate(-45deg);
      }
    }
  }
  .readr-media-react-image {
    max-width: 90vw;
    max-height: 90vh;
    margin: 0 auto;
    cursor: auto;
  }
`
export function ImageBlock(
  entity: DraftEntityInstance,
  contentLayout = 'normal'
) {
  const lightBoxRef = useRef(null)

  const [shouldOpenLightBox, setShouldOpenLightBox] = useState(false)
  const { name, desc, resized, url } = entity.getData()
  const handleOpen = () => {
    if (url) {
      return
    }
    setShouldOpenLightBox(true)
  }

  let imgBlock = (
    <ImageFigure
      key={resized.original}
      contentLayout={contentLayout}
      onClick={handleOpen}
    >
      <CustomImage
        images={resized}
        defaultImage={defaultImage}
        loadingImage={loadingImage}
        width={''}
        height={'auto'}
        objectFit={'contain'}
        alt={name}
        rwd={{ mobile: '100vw', tablet: '640px', default: '640px' }}
        priority={false}
      ></CustomImage>
      {desc ? (
        <Figcaption
          contentLayout={contentLayout}
          onClick={(e) => e.stopPropagation()}
        >
          {desc}
        </Figcaption>
      ) : null}
    </ImageFigure>
  )
  useEffect(() => {
    if (lightBoxRef && lightBoxRef.current) {
      const lightBox = lightBoxRef.current
      if (shouldOpenLightBox) {
        disableBodyScroll(lightBox)
      } else {
        enableBodyScroll(lightBox)
      }
    }
    return () => {
      clearAllBodyScrollLocks()
    }
  }, [shouldOpenLightBox])
  const lightBox = (
    <LightBoxWrapper onClick={() => setShouldOpenLightBox(false)}>
      <Figure ref={lightBoxRef} onClick={(e) => e.stopPropagation()}>
        <CustomImage
          images={resized}
          defaultImage={defaultImage}
          loadingImage={loadingImage}
          alt={name}
          rwd={{ mobile: '90vw', default: '90vw' }}
          width={''}
          height={''}
          priority={false}
        ></CustomImage>
      </Figure>
      <button>
        <i className="close"></i>
      </button>
    </LightBoxWrapper>
  )

  if (url) {
    imgBlock = (
      <Anchor href={url} target="_blank">
        {imgBlock}
      </Anchor>
    )
  } else {
    imgBlock = (
      <>
        {shouldOpenLightBox && lightBox}
        {imgBlock}
      </>
    )
  }

  return imgBlock
}
