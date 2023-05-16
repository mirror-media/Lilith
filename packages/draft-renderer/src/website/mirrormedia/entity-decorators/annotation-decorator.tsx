import React, { useState } from 'react'
import styled, { css } from 'styled-components'

const colorNormal = '#054f77'
const colorWide = 'rgba(64, 64, 64, 0.87);'

const annotatedTextNormal = css`
  color: ${colorNormal};
`
const annotatedTextWide = css`
  color: ${colorWide};
`
const AnnotatedText = styled.span`
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
      default:
        return annotatedTextNormal
    }
  }}
`
//for setting color of text, color of `<li>` marker in `<ul>` and `<ol>`.

const annotationBodyNormal = css`
  color: ${colorNormal};
  margin-top: 16px;
  margin-bottom: 24px;
  ul {
    li {
      background-color: ${colorNormal};
    }
  }
  ol {
    li {
      &::before {
        color: ${colorNormal};
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
  color: ${colorWide};
  margin-top: 16px;
  margin-bottom: 24px;
  border: 1px solid black;
  ul {
    li {
      &::before {
        background-color: ${colorWide};
      }
    }
  }
  ol {
    li {
      &::before {
        color: ${colorWide};
      }
    }
  }
  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 8px;
    margin-bottom: 32px;
  }
`

const annotationBodyLineHeight = 1.8
const AnnotationBody = styled.div`
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
      default:
        return annotationBodyNormal
    }
  }}
`
const getSvgColor = (contentLayout = 'normal') => {
  switch (contentLayout) {
    case 'normal':
      return '#054f77'
    case 'wide':
      return '#333333'
    default:
      return '#054f77'
  }
}

function indicatorSvg(shouldRotate: boolean, contentLayout = 'normal') {
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

export const annotationDecorator = (contentLayout = 'normal') => {
  return {
    strategy: findAnnotationEntities,
    component: AnnotationBlock,
    props: { contentLayout },
  }
}
