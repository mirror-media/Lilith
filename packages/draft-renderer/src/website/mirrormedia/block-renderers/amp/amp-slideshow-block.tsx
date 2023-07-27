import React from 'react'
import styled from 'styled-components'
import { EntityInstance } from 'draft-js'
import { defaultMarginTop, defaultMarginBottom } from '../../shared-style'
import defaultImage from '../../assets/default-og-img.png'

const sliderWidth = '100%'

const Wrapper = styled.figure`
  ${defaultMarginTop}
  ${defaultMarginBottom}
  position: relative;
  min-height: 58.75vw;
  ${({ theme }) => theme.breakpoint.md} {
    min-height: 428px;
  }

  .amp-carousel-button {
    position: absolute;
    top: 50%;
    z-index: 1;
    transform: translateY(-50%);
    color: white;
    height: 100%;
    width: 40px;
    background: none;
    &:focus {
      border: none;
      outline: none;
    }
    &::before {
      content: '';
      width: 16px;
      height: 16px;
      top: 50%
      transform: rotate(45deg) translateY(-50%);
      cursor: pointer;
      display: block;
      position: absolute;
    }
  }

  .amp-carousel-button-prev {
    left: 0;
    &::before {
      border-left: 2px solid #fff;
      border-bottom: 2px solid #fff;
      left: 9px;
      transform: rotate(45deg) translate(0, -50%);
    }
  }

  .amp-carousel-button-next {
    right: 0;
    &::before {
      content: ' ';
      border-right: 2px solid #fff;
      border-top: 2px solid #fff;
      left: unset;
      transform: rotate(45deg) translate(-50%, 0);
      right: 9px;
    }
  }
`

const SlideImage = styled.div`
  position: relative;
  object-position: center center;
  background-color: rgba(0, 0, 0, 0.1);
  max-width: ${sliderWidth};
  min-width: ${sliderWidth};
  max-height: 58.75vw;
  min-height: 58.75vw;
  ${({ theme }) => theme.breakpoint.md} {
    min-width: 100%;
    min-height: 428px;
    max-width: 100%;
    max-height: 428px;
  }

  .contain img {
    object-fit: contain;
  }
`

// const Desc = styled('amp-fit-text')`
//   font-size: 14px;
//   line-height: 1.8;
//   font-weight: 400;
//   color: rgba(0, 0, 0, 0.5);
//   margin-top: 20px;
//   min-height: 1.8rem;
//   font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
//     'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
//     'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
// `

export function AmpSlideshowBlockV2(entity: EntityInstance) {
  const { images = [], delay = 2 } = entity.getData()

  return (
    <>
      <Wrapper>
        <amp-carousel
          class="carousel1"
          layout="fill"
          type="slides"
          autoplay=""
          loop=""
          control=""
          delay={delay * 1000}
          aria-label="Carousel"
        >
          {images.map((slide) => {
            return (
              <div key={slide.id} className="slide">
                <SlideImage>
                  <amp-img
                    class="contain"
                    src={slide?.resized?.original ?? defaultImage}
                    layout="fill"
                    alt={slide?.name}
                  ></amp-img>
                </SlideImage>

                {/* <Desc layout="responsive" width="500" height="150">
          {slide.desc}
        </Desc> */}
              </div>
            )
          })}
        </amp-carousel>
      </Wrapper>
    </>
  )
}
