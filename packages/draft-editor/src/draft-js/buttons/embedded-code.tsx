import React, { Fragment, useState } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { TextInput, TextArea } from '@keystone-ui/fields'
import type { ButtonProps } from './type'

type EmbeddedCodeButtonProps = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
>

export function EmbeddedCodeButton(props: EmbeddedCodeButtonProps) {
  const { editorState, onChange, className } = props

  const [toShowInput, setToShowInput] = useState(false)
  const [inputValue, setInputValue] = useState({
    caption: '',
    embeddedCode: '',
  })

  const promptForInput = () => {
    setToShowInput(true)
    setInputValue({
      caption: '',
      embeddedCode: '',
    })
  }

  const confirmInput = () => {
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'EMBEDDEDCODE',
      'IMMUTABLE',
      inputValue
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))

    setToShowInput(false)
    setInputValue({
      caption: '',
      embeddedCode: '',
    })
  }

  const input = (
    <DrawerController isOpen={toShowInput}>
      <Drawer
        title={`Insert Embedded Code`}
        //isOpen={toShowInput}
        actions={{
          cancel: {
            label: 'Cancel',
            action: () => {
              setToShowInput(false)
            },
          },
          confirm: {
            label: 'Confirm',
            action: confirmInput,
          },
        }}
      >
        <TextInput
          onChange={(e) =>
            setInputValue({
              caption: e.target.value,
              embeddedCode: inputValue.embeddedCode,
            })
          }
          type="text"
          placeholder="Caption"
          value={inputValue.caption}
          style={{ marginBottom: '10px', marginTop: '30px' }}
        />
        <TextArea
          onChange={(e) =>
            setInputValue({
              caption: inputValue.caption,
              embeddedCode: e.target.value,
            })
          }
          placeholder="Embedded Code"
          type="text"
          value={inputValue.embeddedCode}
          style={{ marginBottom: '30px' }}
        />
      </Drawer>
    </DrawerController>
  )

  return (
    <Fragment>
      {input}
      <div
        onClick={() => {
          promptForInput()
        }}
        className={className}
      >
        <i className="far"></i>
        <span>Embed</span>
      </div>
    </Fragment>
  )
}
