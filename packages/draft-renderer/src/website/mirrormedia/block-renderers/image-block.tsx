//REMINDER: DO NOT REMOVE className which has prefix `GTM-`, since it is used for collecting data of Google Analytics event.

import React, { useState, useEffect, useRef, ReactNode } from 'react'
import { ContentBlock, ContentState } from 'draft-js'
import styled, { css } from 'styled-components'
import defaultImage from '../assets/default-og-img.png'
import loadingImage from '../assets/loading.gif'
import CustomImage from '@readr-media/react-image'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock'
import { ContentLayout } from '../types'

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

const AmpImgWrapper = styled.section`
  margin-top: 20px;
  width: 100%;
  height: 50vw;
  position: relative;
  display: flex;
  justify-content: center;
  amp-img img {
    object-fit: contain;
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

const Figure = styled.figure<{ aspectRatio: string }>`
  /* margin-block: unset; */
  /* margin-inline: unset; */
  ${defaultMarginTop}
  ${defaultMarginBottom}
  .readr-media-react-image {
    cursor: pointer;
    aspect-ratio: ${({ aspectRatio }) =>
      aspectRatio ? aspectRatio : 'inherit'};
  }
`
const ImageFigure = styled(Figure)<{
  contentLayout: ContentLayout
}>`
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

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
`

const AdWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
`

const Figcaption = styled.figcaption<{ contentLayout: ContentLayout }>`
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

type ImageBlockProps = {
  block: ContentBlock
  blockProps: {
    contentLayout: ContentLayout
    firstImageAdComponent: ReactNode
  }
  contentState: ContentState
}

export function ImageBlock(props: ImageBlockProps) {
  const { block, contentState, blockProps } = props
  const entityKey = block.getEntityAt(0)

  const entity = contentState.getEntity(entityKey)
  const { contentLayout = 'normal', firstImageAdComponent } = blockProps

  const lightBoxRef = useRef(null)
  const isAmp = contentLayout === 'amp'

  const [shouldOpenLightBox, setShouldOpenLightBox] = useState(false)
  const {
    name,
    desc,
    resized,
    url,
    resizedWebp = null,
    imageFile = {},
    isFirstImage,
  } = entity.getData()
  //imageFile in possibly a `null`
  const aspectRatio =
    imageFile && imageFile?.width && imageFile?.height
      ? `${imageFile.width} / ${imageFile.height}`
      : 'inherit'
  const hasDescription = Boolean(desc)
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

  const handleOpen = () => {
    if (url) {
      return
    }
    setShouldOpenLightBox(true)
  }

  const imageJsx = isAmp ? (
    /**
     * The rules for fallback of the heroImage:
     * 1. Show w1600 first.
     * 2. If the URL of w1600 is an empty string or an invalid URL, then show the original by using <amp-img> with `fallback` attribute.
     * 3. If the URL of original is an empty string, then show the default image url by replacing src of <amp-img>.
     */
    <AmpImgWrapper>
      {resized ? (
        <>
          {/** @ts-ignore amp-html-tag*/}
          <amp-img src={resized?.w1600} alt={name} layout="fill">
            {/** @ts-ignore amp-html-tag*/}
            <amp-img
              fallback=""
              src={resized?.original ? resized?.original : defaultImage}
              alt={name}
              layout="fill"
            ></amp-img>
          </amp-img>
        </>
      ) : (
        <>
          {/** @ts-ignore amp-html-tag*/}
          <amp-img src={defaultImage} alt={name} layout="fill"></amp-img>
        </>
      )}
    </AmpImgWrapper>
  ) : (
    <ImageWrapper contentLayout={contentLayout}>
      <CustomImage
        images={resized}
        imagesWebP={resizedWebp}
        defaultImage={defaultImage}
        loadingImage={loadingImage}
        width={''}
        height={'auto'}
        objectFit={'contain'}
        alt={name}
        rwd={{ mobile: '100vw', tablet: '640px', default: '640px' }}
        priority={false}
      ></CustomImage>
      {isFirstImage ? <AdWrapper>{firstImageAdComponent}</AdWrapper> : null}
    </ImageWrapper>
  )

  const imageFigureJsx = (
    <ImageFigure
      key={resized.original}
      contentLayout={contentLayout}
      aspectRatio={aspectRatio}
      onClick={handleOpen}
    >
      {imageJsx}
      {hasDescription && (
        <Figcaption
          contentLayout={contentLayout}
          onClick={(e) => e.stopPropagation()}
        >
          {desc}
        </Figcaption>
      )}
    </ImageFigure>
  )

  const lightBox = (
    <LightBoxWrapper onClick={() => setShouldOpenLightBox(false)}>
      <Figure ref={lightBoxRef} onClick={(e) => e.stopPropagation()}>
        <CustomImage
          images={resized}
          imagesWebP={resizedWebp}
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

  const renderImageBlockJsx = url ? (
    <Anchor href={url} target="_blank" className="GTM-story-image">
      {imageFigureJsx}
    </Anchor>
  ) : (
    <>
      {shouldOpenLightBox && lightBox}
      {imageFigureJsx}
    </>
  )

  return renderImageBlockJsx
}
