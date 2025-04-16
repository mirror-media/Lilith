import React, { Fragment, useState } from 'react'
import {
  EditorState,
  RichUtils,
  convertToRaw,
  DraftDecoratorType,
} from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import draftConverter from '../draft-converter'
import type { ButtonProps } from './type'

function escapeHTML(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
}

type AnnotationButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
> & {
  isActive?: boolean
  decorators?: DraftDecoratorType
  renderBasicEditor: (
    props: Pick<AnnotationButtonProps, 'editorState' | 'onChange'>
  ) => React.ReactElement
}

export function AnnotationButton(props: AnnotationButtonProps) {
  const toggleEntity = RichUtils.toggleLink
  const {
    isActive,
    editorState,
    onChange,
    renderBasicEditor,
    decorators,
    className,
  } = props
  const [toShowInput, setToShowInput] = useState(false)
  const [inputValue, setInputValue] = useState({
    editorStateOfBasicEditor: EditorState.createEmpty(decorators),
  })

  const promptForAnnotation = (e: React.MouseEvent) => {
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
    <Fragment>
      {urlInput}
      <div
        className={className}
        onMouseDown={isActive ? removeAnnotation : promptForAnnotation}
      >
        <span>Annotation</span>
      </div>
    </Fragment>
  )
}
