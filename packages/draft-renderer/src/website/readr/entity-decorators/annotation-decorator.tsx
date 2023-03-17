import React, { useState } from 'react'
import styled from 'styled-components'

const AnnotatedText = styled.span`
  display: inline-block;
  cursor: pointer;

  svg {
    display: inline-flex;
    width: 24px;
    height: 24px;
    vertical-align: middle;
    margin: 0 4px;
    transition: transform 0.3s;
  }

  path {
    width: 5px;
    transform: translate(calc(50% - 5px), calc(50% - 2.9px));
  }
`

const AnnotationBody = styled.div`
  width: 600px;
  border-radius: 2px;
  background-color: #f6f6fb;
  padding: 12px 24px;
  margin: 8px 0 32px;
  font-size: 16px;
  line-height: 24px;
  display: inline-block;
  text-align: left;
  width: 100%;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 16px 32px;
  }
`

function indicatorSvg(shouldRotate: boolean) {
  const transform = shouldRotate ? '' : 'rotate(-180)'
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      transform={transform}
    >
      <circle cx="10" cy="10" r="10" fill="#f6f6fb" />

      <path
        d="m9.81473.492288c-.12331-.125265-.26952-.187845-.4385-.187845h-8.730815c-.169011 0-.31512.06258-.438567.187845-.123413.125402-.1851195.273662-.1851195.445056 0 .171356.0617065.319616.1851195.444916l4.365422 4.42968c.12362.12527.2697.18798.43861.18798.16884 0 .31508-.06271.43846-.18798l4.36539-4.42971c.12331-.12527.18526-.27353.18526-.444921 0-.171359-.06195-.319619-.18526-.445021"
        fill="#2b2b2b"
      ></path>
    </svg>
  )
}

function AnnotationBlock(props) {
  const { children: annotated } = props
  const [toShowAnnotation, setToShowAnnotation] = useState(false)
  const { bodyHTML } = props.contentState.getEntity(props.entityKey).getData()
  return (
    <React.Fragment>
      <AnnotatedText
        onClick={(e) => {
          e.preventDefault()
          setToShowAnnotation(!toShowAnnotation)
        }}
      >
        {annotated}
        <span>
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
