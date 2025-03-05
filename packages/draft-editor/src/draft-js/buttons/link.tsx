import React, { Fragment, useEffect, useState } from 'react'
import styled from 'styled-components'
import { AlertDialog } from '@keystone-ui/modals'
import { EditorState, RichUtils } from 'draft-js'
import { TextInput } from '@keystone-ui/fields'

import { getSelectionEntityData } from '../util'
import type { ButtonProps } from './type'

const StyledTextInput = styled(TextInput)`
  fontfamily: Georgia, serif;
  marginright: 10;
  padding: 10;
`

type LinkButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
>

export function LinkButton(props: LinkButtonProps) {
  const { editorState, className, onChange } = props

  const entityData = getSelectionEntityData(editorState)
  const url = entityData?.url || ''

  useEffect(() => {
    setLinkUrl(url)
  }, [url])

  const [toShowUrlInput, setToShowUrlInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState(url || '')

  const promptForLink = (e: React.MouseEvent) => {
    e.preventDefault()
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) {
      setToShowUrlInput(true)
    }
  }

  const confirmLink = () => {
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'LINK',
      'MUTABLE',
      { url: linkUrl }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })
    const selection = newEditorState.getSelection()
    // RichUtils.toggleLink will reset selection back to first block and cause
    // the editor scroll to top. Use `forceSelection` to hold the selection.
    onChange(
      EditorState.forceSelection(
        RichUtils.toggleLink(newEditorState, selection, entityKey),
        selection
      )
    )

    setToShowUrlInput(false)
  }

  const onLinkInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.which === 13) {
      e.preventDefault()
      confirmLink()
    }
  }

  const removeLink = () => {
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) {
      // RichUtils.toggleLink will reset selection back to first block and cause
      // the editor scroll to top. Use `forceSelection` to hold the selection.
      onChange(
        EditorState.forceSelection(
          RichUtils.toggleLink(editorState, selection, null),
          selection
        )
      )
    }
    setToShowUrlInput(false)
  }

  const alertProps = linkUrl
    ? {
        title: 'Update Link',
        actions: {
          cancel: {
            label: 'Remove',
            action: removeLink,
          },
          confirm: {
            label: 'Update',
            action: confirmLink,
          },
        },
      }
    : {
        title: 'Insert Link',
        actions: {
          cancel: {
            label: 'Cancel',
            action: removeLink,
          },
          confirm: {
            label: 'Confirm',
            action: confirmLink,
          },
        },
      }

  const urlInput = (
    <AlertDialog
      title={alertProps.title}
      isOpen={toShowUrlInput}
      actions={alertProps.actions}
    >
      <StyledTextInput
        onChange={(e) => setLinkUrl(e.target.value)}
        value={linkUrl}
        type="text"
        onKeyDown={onLinkInputKeyDown}
      />
    </AlertDialog>
  )

  return (
    <Fragment>
      {urlInput}
      <div className={className} onMouseDown={promptForLink}>
        <i className="fas fa-link"></i>
      </div>
    </Fragment>
  )
}
