import React, { useState } from 'react'
import styled from 'styled-components'

const AnnotatedText = styled.span`
  vertical-align: middle;
  color: #d0a67d;

  svg {
    vertical-align: middle;
    margin-left: 5px;
  }
`

const AnnotationBody = styled.div`
  background-color: #f1f1f1;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 10px;
`

function indicatorSvg(shouldRotate: boolean) {
  const transform = shouldRotate ? 'rotate(180 10 10)' : ''
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="10" fill="#f1f1f1" />
      <path
        d="M10 15L5.66987 7.5L14.3301 7.5L10 15Z"
        fill="#D0A67D"
        transform={transform}
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
