import CustomImage from '@readr-media/react-image'
import React from 'react'
import styled, { css } from 'styled-components'

import defaultImage from '../assets/default-og-img.png'
import arrowDown from '../assets/slideshow-arrow-down.png'
import arrowUp from '../assets/slideshow-arrow-up.png'

const arrowShareStyle = css`
  width: 64px;
  height: 64px;
  margin: auto;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 64px;
  cursor: pointer;
  border-radius: 50%;
  visibility: ${(props) => (props.shouldHideArrow ? 'hidden' : 'visible')};

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`

const SideBarWrapper = styled.div`
  width: 64px;
  position: relative;

  .sidebar-images {
    overflow-y: scroll;
    max-height: 520px;
    scrollbar-width: none;
    margin: 12px auto;

    &::-webkit-scrollbar {
      display: none; /* for Chrome, Safari, and Opera */
    }
  }
`

const ArrowUp = styled.div`
  ${arrowShareStyle}
  background-image: url(${arrowUp});
`

const ArrowDown = styled.div`
  ${arrowShareStyle}
  background-image: url(${arrowDown});
`

const SideBarImage = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  cursor: pointer;
  filter: ${(props) => (props.isfocused ? 'none' : 'brightness(35%)')};

  &:hover {
    filter: ${(props) => (props.isfocused ? 'none' : 'brightness(60%)')};
  }

  & + * {
    margin-top: 12px;
  }
`

export default function SlideshowSideBar({
  focusImageIndex,
  images,
  setFocusImageIndex,
  imagesRefs,
}) {
  const handleScrollUp = () => {
    if (focusImageIndex > 0) {
      setFocusImageIndex(focusImageIndex - 1)
      imagesRefs?.current[focusImageIndex - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  const handleScrollDown = () => {
    if (focusImageIndex < images?.length - 1) {
      setFocusImageIndex(focusImageIndex + 1)
      imagesRefs?.current[focusImageIndex + 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  const handleScrollIntoView = (index) => {
    setFocusImageIndex(index)
    imagesRefs?.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  const sideBarImages = images.map((image, index) => {
    return (
      <SideBarImage
        key={image?.id}
        isfocused={focusImageIndex === index}
        onClick={() => {
          handleScrollIntoView(index)
        }}
        ref={(el) => {
          if (imagesRefs?.current) {
            imagesRefs.current[index] = el
          }
        }}
      >
        <CustomImage
          images={image?.resized}
          defaultImage={defaultImage}
          alt={image?.name}
          rwd={{
            desktop: '64px',
            default: '100%',
          }}
          priority={true}
        />
      </SideBarImage>
    )
  })

  return (
    <SideBarWrapper>
      <ArrowUp
        onClick={handleScrollUp}
        shouldHideArrow={focusImageIndex === 0}
      />
      <div className="sidebar-images">{sideBarImages}</div>
      <ArrowDown
        onClick={handleScrollDown}
        shouldHideArrow={focusImageIndex + 1 === images?.length}
      />
    </SideBarWrapper>
  )
}
