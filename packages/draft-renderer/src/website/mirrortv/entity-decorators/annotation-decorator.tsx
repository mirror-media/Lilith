import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { ContentLayout } from '../types'
import { convertEmbeddedToAmp } from '../utils'
const annotationBodyColorNormal = {
  backgroundColor: '#F2F2F2',
  textColor: '#054f77',
}
const annotationBodyColorWide = {
  backgroundColor: '#E3E3E3',
  textColor: 'rgba(0, 0, 0, 0.87)',
}
const annotationBodyColorPremium = {
  backgroundColor: '#F3F5F6',
  textColor: 'rgba(0, 0, 0, 0.87)',
}

const annotatedTextNormal = css`
  color: #054f77;
`
const annotatedTextWide = css`
  color: rgba(64, 64, 64, 0.87);
`
const annotatedTextPremium = css`
  color: #054f77;
`
const AnnotatedText = styled.span<{ contentLayout: ContentLayout }>`
  text-decoration: underline;
  svg {
    display: inline;
    vertical-align: baseline;
    margin-left: 9px;
    margin-right: 9px;
    transform: translateY(-50%);
  }

  ${({ contentLayout }) => {
    switch (contentLayout) {
      case 'normal':
        return annotatedTextNormal
      case 'wide':
        return annotatedTextWide
      case 'premium':
        return annotatedTextPremium
      default:
        return annotatedTextNormal
    }
  }}
`
//for setting color of text, color of `<li>` marker in `<ul>` and `<ol>`.

const annotationBodyNormal = css`
  color: ${annotationBodyColorNormal.textColor};
  background-color: ${annotationBodyColorNormal.backgroundColor};
  margin-top: 16px;
  margin-bottom: 24px;
  ul {
    li {
      &::before {
        background-color: ${annotationBodyColorNormal.textColor};
      }
    }
  }
  ol {
    li {
      &::before {
        color: ${annotationBodyColorNormal.textColor};
      }
    }
  }
  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 24px;
    margin-bottom: 24px;
  }
`
const annotationBodyWide = css`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  color: ${annotationBodyColorWide.textColor};
  background-color: ${annotationBodyColorWide.backgroundColor};

  margin-top: 16px;
  margin-bottom: 24px;
  border: 1px solid black;
  ul {
    li {
      &::before {
        background-color: ${annotationBodyColorWide.textColor};
      }
    }
  }
  ol {
    li {
      &::before {
        color: ${annotationBodyColorWide.textColor};
      }
    }
  }
  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 8px;
    margin-bottom: 32px;
  }
`

const annotationBodyPremium = css`
  color: ${annotationBodyColorPremium.textColor};
  background-color: ${annotationBodyColorPremium.backgroundColor};

  margin-top: 16px;
  margin-bottom: 24px;
  ul {
    li {
      &::before {
        background-color: ${annotationBodyColorPremium.textColor};
      }
    }
  }
  ol {
    li {
      &::before {
        color: ${annotationBodyColorPremium.textColor};
      }
    }
  }
  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 8px;
    margin-bottom: 32px;
  }
`

const annotationBodyLineHeight = 1.8
const AnnotationBody = styled.div<{ contentLayout: ContentLayout }>`
  background-color: #e3e3e3;
  padding: 24px 32px;
  font-size: 16px;
  line-height: ${annotationBodyLineHeight};

  > * + * {
    margin-top: 20px;
  }
  a {
    text-decoration: underline;
  }
  ul {
    margin-left: 18px;

    li {
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: calc((1rem * ${annotationBodyLineHeight}) / 2);
        left: -12px;
        width: 6px;
        height: 6px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
      }
    }
  }
  ol {
    margin-left: 18px;
    li {
      position: relative;
      counter-increment: list;
      padding-left: 6px;
      &::before {
        content: counter(list) '.';
        position: absolute;
        left: -15px;
        width: 15px;
      }
    }
  }
  ${({ contentLayout }) => {
    switch (contentLayout) {
      case 'normal':
        return annotationBodyNormal
      case 'wide':
        return annotationBodyWide
      case 'premium':
        return annotationBodyPremium
      default:
        return annotationBodyNormal
    }
  }}
`
const getSvgColor = (contentLayout: ContentLayout = 'normal') => {
  switch (contentLayout) {
    case 'normal':
      return '#054f77'
    case 'wide':
      return '#333333'
    case 'premium':
      return '#054f77'
    default:
      return '#054f77'
  }
}

function indicatorSvg(
  shouldRotate: boolean,
  contentLayout: ContentLayout = 'normal'
) {
  const svgColor = getSvgColor(contentLayout)
  const transform = `translateY(-50%)${shouldRotate ? 'rotate(180deg)' : ''}`
  return (
    <svg
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform }}
    >
      <path
        d="M7.68981 0.28664C7.31321 -0.0955464 6.68679 -0.0955466 6.31019 0.286639L0.269402 6.417C-0.315817 7.01089 0.115195 8 0.959209 8L13.0408 8C13.8848 8 14.3158 7.01089 13.7306 6.417L7.68981 0.28664Z"
        fill={svgColor}
      />
    </svg>
  )
}
/**
 * TODO: add props type
 */
function AmpAnnotationBlock(props) {
  const { children: annotated, contentLayout = 'normal' } = props
  const { bodyHTML } = props.contentState.getEntity(props.entityKey).getData()
  return (
    <React.Fragment>
      <AnnotatedText contentLayout={contentLayout}>
        {annotated}
        <span
          on="tap:annotation-body.toggleVisibility, arrow-up.toggleVisibility, array-down.toggleVisibility"
          role="button"
          tabindex={annotated}
        >
          <span id="arrow-up">{indicatorSvg(false, contentLayout)}</span>
          <span id="array-down" hidden>
            {indicatorSvg(true, contentLayout)}
          </span>
        </span>
      </AnnotatedText>
      <AnnotationBody
        hidden
        id="annotation-body"
        contentLayout={contentLayout}
        contentEditable={false}
        dangerouslySetInnerHTML={{ __html: convertEmbeddedToAmp(bodyHTML) }}
      ></AnnotationBody>
    </React.Fragment>
  )
}
/**
 * TODO: add props type
 */
function AnnotationBlock(props) {
  const { children: annotated, contentLayout = 'normal' } = props

  const [toShowAnnotation, setToShowAnnotation] = useState(false)
  const { bodyHTML } = props.contentState.getEntity(props.entityKey).getData()
  return (
    <React.Fragment>
      <AnnotatedText contentLayout={contentLayout}>
        {annotated}
        <span
          onClick={(e) => {
            e.preventDefault()
            setToShowAnnotation(!toShowAnnotation)
          }}
        >
          {toShowAnnotation
            ? indicatorSvg(false, contentLayout)
            : indicatorSvg(true, contentLayout)}
        </span>
      </AnnotatedText>
      {toShowAnnotation ? (
        <AnnotationBody
          contentLayout={contentLayout}
          contentEditable={false}
          dangerouslySetInnerHTML={{ __html: bodyHTML }}
        ></AnnotationBody>
      ) : null}
    </React.Fragment>
  )
}

function findAnnotationEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'ANNOTATION'
    )
  }, callback)
}

export const annotationDecorator = (
  contentLayout: ContentLayout = 'normal'
) => {
  return {
    strategy: findAnnotationEntities,
    component: contentLayout === 'amp' ? AmpAnnotationBlock : AnnotationBlock,
    props: { contentLayout },
  }
}
