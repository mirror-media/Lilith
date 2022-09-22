import React, { useState } from 'react'
import { EditorState, RichUtils, convertToRaw } from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import decorators from './entity-decorator'
import draftConverter from '../../draft-to-api-data/draft-converter'
import styled from 'styled-components'

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

function escapeHTML(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
}

export function AnnotationButton(props) {
  const toggleEntity = RichUtils.toggleLink
  const { isActive, editorState, onChange, renderBasicEditor } = props
  const [toShowInput, setToShowInput] = useState(false)
  const [inputValue, setInputValue] = useState({
    editorStateOfBasicEditor: EditorState.createEmpty(decorators),
  })

  const promptForAnnotation = (e) => {
    e.preventDefault()
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) {
      setToShowInput(true)
    }
  }

  const confirmAnnotation = () => {
    const contentState = editorState.getCurrentContent()
    const rawContentState = convertToRaw(
      inputValue.editorStateOfBasicEditor.getCurrentContent()
    )
    const bodyHTML = draftConverter.convertToHtml(rawContentState)
    const contentStateWithEntity = contentState.createEntity(
      'ANNOTATION',
      'MUTABLE',
      {
        rawContentState,
        bodyHTML,
        bodyEscapedHTML: escapeHTML(bodyHTML),
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    onChange(
      toggleEntity(newEditorState, newEditorState.getSelection(), entityKey)
    )

    setToShowInput(false)
    setInputValue({
      editorStateOfBasicEditor: EditorState.createEmpty(decorators),
    })
  }

  const removeAnnotation = () => {
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) {
      onChange(toggleEntity(editorState, selection, null))
    }
    setToShowInput(false)
    setInputValue({
      editorStateOfBasicEditor: EditorState.createEmpty(decorators),
    })
  }

  const basicEditorJsx = renderBasicEditor({
    editorState: inputValue.editorStateOfBasicEditor,
    onChange: (editorStateOfBasicEditor: EditorState) => {
      setInputValue({
        editorStateOfBasicEditor,
      })
    },
  })

  const urlInput = (
    <DrawerController isOpen={toShowInput}>
      <Drawer
        title="Insert Annotation"
        actions={{
          cancel: {
            label: 'Cancel',
            action: removeAnnotation,
          },
          confirm: {
            label: 'Confirm',
            action: confirmAnnotation,
          },
        }}
      >
        {basicEditorJsx}
      </Drawer>
    </DrawerController>
  )

  return (
    <React.Fragment>
      {urlInput}
      <div
        className={props.className}
        onMouseDown={isActive ? removeAnnotation : promptForAnnotation}
      >
        <i className="far"></i>
        <span>Annotation</span>
      </div>
    </React.Fragment>
  )
}

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
