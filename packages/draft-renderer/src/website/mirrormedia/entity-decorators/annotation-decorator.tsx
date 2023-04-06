import React, { useState } from 'react'
import styled from 'styled-components'

const AnnotatedText = styled.span`
  color: #054f77;

  text-decoration: underline;
  svg {
    display: inline;
    vertical-align: baseline;
    margin-left: 9px;
    margin-right: 9px;
    transform: translateY(-50%);
  }
`
const annotationBodyLineHeight = 1.8
const AnnotationBody = styled.div`
  background-color: #e3e3e3;
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 24px 32px;
  color: #054f77;
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
        background-color: #054f77;
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
        color: #054f77;
        left: -15px;
        width: 15px;
      }
    }
  }
`

function indicatorSvg(shouldRotate: boolean) {
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
        fill="#054F77"
      />
    </svg>
  )
}

function AnnotationBlock(props) {
  const { children: annotated } = props
  const [toShowAnnotation, setToShowAnnotation] = useState(false)
  const { bodyHTML } = props.contentState.getEntity(props.entityKey).getData()
  return (
    <React.Fragment>
      <AnnotatedText>
        {annotated}
        <span
          onClick={(e) => {
            e.preventDefault()
            setToShowAnnotation(!toShowAnnotation)
          }}
        >
          {toShowAnnotation ? indicatorSvg(false) : indicatorSvg(true)}
        </span>
      </AnnotatedText>
      {toShowAnnotation ? (
        <AnnotationBody
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

export const annotationDecorator = {
  strategy: findAnnotationEntities,
  component: AnnotationBlock,
}
