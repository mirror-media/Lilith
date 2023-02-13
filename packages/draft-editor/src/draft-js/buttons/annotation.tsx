import React, { useState } from 'react'
import { BasicEditor } from '../editor/basic-editor'
import { EditorState, RichUtils, convertToRaw } from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import decorators from '../editor/entity-decorator'
import draftConverter from '../editor/draft-converter'

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
  const { isActive, editorState, onChange } = props
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
        <BasicEditor
          editorState={inputValue.editorStateOfBasicEditor}
          onChange={(editorStateOfBasicEditor) => {
            setInputValue({
              editorStateOfBasicEditor,
            })
          }}
        />
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
