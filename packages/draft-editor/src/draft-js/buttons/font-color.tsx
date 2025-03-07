import React, { Fragment, useState } from 'react'
import { AlertDialog } from '@keystone-ui/modals'
import { EditorState } from 'draft-js'
import { TextInput } from '@keystone-ui/fields'
import styled from 'styled-components'
import { Modifier } from '../modifier'
import { CUSTOM_STYLE_PREFIX_FONT_COLOR } from '../const'
import type { ButtonProps } from './type'

const ColorHexInput = styled(TextInput)`
  font-family: Georgia, serif;
  margin-right: 10px;
  padding: 10px;
`

type FontColorButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
> & {
  isActive?: boolean
}

export function FontColorButton(props: FontColorButtonProps) {
  const { isActive, editorState, onChange, className } = props

  const [toShowColorInput, setToShowColorInput] = useState(false)
  const [colorValue, setColorValue] = useState('')

  const promptForColor = (e: React.MouseEvent) => {
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

  const onColorInputKeyDown = (e: React.KeyboardEvent) => {
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
    <Fragment>
      {colorInput}
      <div
        className={className}
        onMouseDown={isActive ? removeColor : promptForColor}
      >
        <i className="fas fa-palette"></i>
      </div>
    </Fragment>
  )
}
