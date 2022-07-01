import React, { useState } from 'react'
import { AlertDialog } from '@keystone-ui/modals'
import { EditorState, RichUtils } from 'draft-js'
import { TextInput } from '@keystone-ui/fields'

const styles = {
  link: {
    color: '#3b5998',
    textDecoration: 'underline',
  },
  button: {
    marginTop: '10px',
    marginRight: '10px',
    cursor: 'pointer',
  },
  urlInput: {
    fontFamily: "'Georgia', serif",
    marginRight: 10,
    padding: 10,
  },
}

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    )
  }, callback)
}

export const linkDecorator = {
  strategy: findLinkEntities,
  component: Link,
}

export function LinkButton(props) {
  const { isActive, editorState, onChange } = props

  const [toShowUrlInput, setToShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState('')

  const promptForLink = (e) => {
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
      { url: urlValue }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })
    onChange(
      RichUtils.toggleLink(
        newEditorState,
        newEditorState.getSelection(),
        entityKey
      )
    )

    setToShowUrlInput(false)
    setUrlValue('')
  }

  const onLinkInputKeyDown = (e) => {
    if (e.which === 13) {
      e.preventDefault()
      confirmLink()
    }
  }

  const removeLink = () => {
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) {
      onChange(RichUtils.toggleLink(editorState, selection, null))
    }
    setToShowUrlInput(false)
    setUrlValue('')
  }

  const urlInput = (
    <AlertDialog
      title="Insert LINK"
      isOpen={toShowUrlInput}
      actions={{
        cancel: {
          label: 'Cancel',
          action: removeLink,
        },
        confirm: {
          label: 'Confirm',
          action: confirmLink,
        },
      }}
    >
      <TextInput
        onChange={(e) => setUrlValue(e.target.value)}
        style={styles.urlInput}
        type="text"
        value={urlValue}
        onKeyDown={onLinkInputKeyDown}
      />
    </AlertDialog>
  )

  return (
    <React.Fragment>
      {urlInput}
      <div
        className={props.className}
        onMouseDown={isActive ? removeLink : promptForLink}
      >
        <i className="fas fa-link"></i>
      </div>
    </React.Fragment>
  )
}

function Link(props) {
  const { url } = props.contentState.getEntity(props.entityKey).getData()
  return (
    <a href={url} style={styles.link}>
      {props.children}
    </a>
  )
}
