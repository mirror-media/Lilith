import React, { useState } from 'react'
import { AlertDialog } from '@keystone-ui/modals'
import { EditorState, Modifier, CharacterMetadata } from 'draft-js'
import { TextInput } from '@keystone-ui/fields'
import styled from 'styled-components'
import { Map } from 'immutable'

const ColorHexInput = styled(TextInput)`
  font-family: Georgia, serif;
  margin-right: 10px;
  padding: 10px;
`

export const CUSTOM_STYLE_PREFIX_FONT_COLOR = 'FONT_COLOR_'

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

  /* 
      This method is specified for custom inline style such as 'FONT_COLOR_#ffffff'.
      For this kind of inline style there may be more than one style name 'FONT_COLOR_#ffffff', 'FONT_COLOR_#000000'.
      To prevent any nested specific inline style got rendered after the outer inline style being removed, 
      clear all specific inline styles when custom inline style is applied or removed.

      Since getCurrentInlineStyle only return the inline style the starting position contains,
      loop through all char of blocks to remove all nested inline styles.
    */
  const resetInlineStyle = (
    contentState,
    selectionState,
    inlineStylePrefix
  ) => {
    const blockMap = contentState.getBlockMap()
    const startKey = selectionState.getStartKey()
    const startOffset = selectionState.getStartOffset()
    const endKey = selectionState.getEndKey()
    const endOffset = selectionState.getEndOffset()

    // loop through all selected blocks and every block chars to remove specific inline style
    const newBlocks = blockMap
      .skipUntil((_, k) => k === startKey)
      .takeUntil((_, k) => k === endKey)
      .concat(Map([[endKey, blockMap.get(endKey)]]))
      .map((block, blockKey) => {
        let sliceStart
        let sliceEnd

        if (startKey === endKey) {
          sliceStart = startOffset
          sliceEnd = endOffset
        } else {
          sliceStart = blockKey === startKey ? startOffset : 0
          sliceEnd = blockKey === endKey ? endOffset : block.getLength()
        }

        let chars = block.getCharacterList()
        let current
        while (sliceStart < sliceEnd) {
          current = chars.get(sliceStart)
          const inlineStyle = current
            .getStyle()
            .find((styleName) => styleName.startsWith(inlineStylePrefix))
          if (inlineStyle) {
            chars = chars.set(
              sliceStart,
              CharacterMetadata.removeStyle(current, inlineStyle)
            )
          }
          sliceStart++
        }

        return block.set('characterList', chars)
      })

    return contentState.merge({
      blockMap: blockMap.merge(newBlocks),
      selectionBefore: selectionState,
      selectionAfter: selectionState,
    })
  }

  const confirmColor = () => {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    let newContentState = resetInlineStyle(
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
      const newContentState = resetInlineStyle(
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
