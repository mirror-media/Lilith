import CustomImage from '@readr-media/react-image'
import React from 'react'
import styled from 'styled-components'

import defaultImage from '../assets/default-og-img.png'
import closeCross from '../assets/slideshow-close-cross.png'
import SlideShowSideBar from './slideshow-sidebar'

const LightBoxWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.breakpoint.xl} {
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

const FocusImageWrapper = styled.div`
  font-weight: 400;
  ${({ theme }) => theme.fontSize.sm};
  line-height: 23px;
  text-align: center;
  color: #ffffff;
`

const FocusImage = styled.figure`
  max-width: 900px;
  max-height: 480px;
  overflow: hidden;
  margin-bottom: 32px;

  ${({ theme }) => theme.breakpoint.xxl} {
    max-width: 960px;
  }
`

const FocusInfo = styled.div`
  .focus-desc {
    max-height: 46px;
    overflow: hidden;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    opacity: 0.87;
    margin-bottom: 12px;
  }

  .focus-number {
    opacity: 0.5;
    margin-top: 12px;
  }
`

const CloseButtonWrapper = styled.div`
  height: 60vh;
  width: 64px;
  position: relative;
`

const CloseButton = styled.div`
  background-image: url(${closeCross});
  width: 64px;
  height: 64px;
  margin: auto;
  background-repeat: no-repeat;
  background-position: center center;
  cursor: pointer;
  position: absolute;
  top: -64px;
  border-radius: 50%;
  background-size: 64px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

export default function SlideshowLightBox({
  focusImageIndex,
  images,
  setShowLightBox,
  setFocusImageIndex,
  imagesRefs,
}) {
  const focusImageDesc = `${images[focusImageIndex].desc}`
  const focusNumber = `${focusImageIndex + 1} / ${images?.length}`

  return (
    <LightBoxWrapper>
      <SlideShowSideBar
        focusImageIndex={focusImageIndex}
        images={images}
        setFocusImageIndex={setFocusImageIndex}
        imagesRefs={imagesRefs}
      />

      <FocusImageWrapper>
        <FocusImage>
          <CustomImage
            images={images[focusImageIndex].resized}
            defaultImage={defaultImage}
            alt={images[focusImageIndex].name}
            rwd={{
              desktop: '64px',
              default: '100%',
            }}
            priority={true}
          />
        </FocusImage>
        <FocusInfo>
          <p className="focus-desc">{focusImageDesc}</p>
          <p className="focus-number">{focusNumber}</p>
        </FocusInfo>
      </FocusImageWrapper>

      <CloseButtonWrapper>
        <CloseButton
          onClick={(e) => {
            e.preventDefault()
            setShowLightBox(false)
          }}
        />
      </CloseButtonWrapper>
    </LightBoxWrapper>
  )
}
