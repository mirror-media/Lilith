import React, { useState } from 'react'
import { AlertDialog } from '@keystone-ui/modals'
import { EditorState } from 'draft-js'
import { TextInput } from '@keystone-ui/fields'
import styled from 'styled-components'
import { Modifier } from '../modifier'
import { CUSTOM_STYLE_PREFIX_FONT_COLOR } from '../const'

const ColorHexInput = styled(TextInput)`
  font-family: Georgia, serif;
  margin-right: 10px;
  padding: 10px;
`

export function FontColorButton(props) {
  const { isActive, editorState, onChange } = props

  const [toShowColorInput, setToShowColorInput] = useState(false)
  const [colorValue, setColorValue] = useState('')

  const promptForColor = (e) => {
    e.preventDefault()
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) {
      setToShowColorInput(true)
    }
  }

  const confirmColor = () => {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    let newContentState = Modifier.removeInlineStyleByPrefix(
      contentState,
      selection,
      CUSTOM_STYLE_PREFIX_FONT_COLOR
    )
    if (colorValue) {
      newContentState = Modifier.applyInlineStyle(
        newContentState,
        selection,
        CUSTOM_STYLE_PREFIX_FONT_COLOR + colorValue
      )
    }
    onChange(
      EditorState.push(editorState, newContentState, 'change-inline-style')
    )

    setToShowColorInput(false)
    setColorValue('')
  }

  const onColorInputKeyDown = (e) => {
    if (e.which === 13) {
      e.preventDefault()
      confirmColor()
    }
  }

  const removeColor = () => {
    const selection = editorState.getSelection()

    if (!selection.isCollapsed()) {
      const contentState = editorState.getCurrentContent()
      const newContentState = Modifier.removeInlineStyleByPrefix(
        contentState,
        selection,
        CUSTOM_STYLE_PREFIX_FONT_COLOR
      )
      onChange(
        EditorState.push(editorState, newContentState, 'change-inline-style')
      )
    }
    setToShowColorInput(false)
    setColorValue('')
  }

  const colorInput = (
    <AlertDialog
      title="Hex Color Code (#ffffff)"
      isOpen={toShowColorInput}
      actions={{
        cancel: {
          label: 'Cancel',
          action: removeColor,
        },
        confirm: {
          label: 'Confirm',
          action: confirmColor,
        },
      }}
    >
      <ColorHexInput
        onChange={(e) => setColorValue(e.target.value)}
        type="text"
        value={colorValue}
        onKeyDown={onColorInputKeyDown}
      />
    </AlertDialog>
  )

  return (
    <React.Fragment>
      {colorInput}
      <div
        className={props.className}
        onMouseDown={isActive ? removeColor : promptForColor}
      >
        <i className="fas fa-palette"></i>
      </div>
    </React.Fragment>
  )
}
