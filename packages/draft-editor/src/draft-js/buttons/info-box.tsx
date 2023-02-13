import React, { useState } from 'react'
import decorators from '../editor/entity-decorator'
import {
  AtomicBlockUtils,
  EditorState,
  RawDraftContentState,
  convertToRaw,
  convertFromRaw,
} from 'draft-js'
import { BasicEditor } from '../editor/basic-editor'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { TextInput } from '@keystone-ui/fields'
import draftConverter from '../editor/draft-converter'
import styled from 'styled-components'

const TitleInput = styled(TextInput)`
  margin-top: 30px;
  margin-bottom: 10px;
`

type InfoBoxInputType = {
  title?: string
  rawContentStateForInfoBoxEditor?: RawDraftContentState
  isOpen: boolean
  onChange: ({
    title,
    rawContentState,
  }: {
    title: string
    rawContentState: RawDraftContentState
  }) => void
  onCancel: () => void
}

export function InfoBoxInput(props: InfoBoxInputType) {
  const {
    isOpen,
    onChange,
    onCancel,
    title,
    rawContentStateForInfoBoxEditor,
  } = props
  const rawContentState = rawContentStateForInfoBoxEditor || {
    blocks: [],
    entityMap: {},
  }
  const initialInputValue = {
    title: title || '',
    // create an `editorState` from raw content state object
    editorStateOfBasicEditor: EditorState.createWithContent(
      convertFromRaw(rawContentState),
      decorators
    ),
  }

  const [inputValue, setInputValue] = useState(initialInputValue)

  const clearInputValue = () => {
    setInputValue(initialInputValue)
  }

  return (
    <DrawerController isOpen={isOpen}>
      <Drawer
        title={`Insert Info Box`}
        actions={{
          cancel: {
            label: 'Cancel',
            action: () => {
              clearInputValue()
              onCancel()
            },
          },
          confirm: {
            label: 'Confirm',
            action: () => {
              onChange({
                title: inputValue.title,
                // convert `contentState` of the `editorState` into raw content state object
                rawContentState: convertToRaw(
                  inputValue.editorStateOfBasicEditor.getCurrentContent()
                ),
              })
              clearInputValue()
            },
          },
        }}
      >
        <TitleInput
          onChange={(e) =>
            setInputValue({
              title: e.target.value,
              editorStateOfBasicEditor: inputValue.editorStateOfBasicEditor,
            })
          }
          type="text"
          placeholder="Title"
          value={inputValue.title}
        />
        <BasicEditor
          editorState={inputValue.editorStateOfBasicEditor}
          onChange={(editorStateOfBasicEditor) => {
            setInputValue({
              title: inputValue.title,
              editorStateOfBasicEditor,
            })
          }}
        />
      </Drawer>
    </DrawerController>
  )
}

type InfoBoxButtonProps = {
  className: string
  editorState: EditorState
  onChange: ({ editorState }: { editorState: EditorState }) => void
}

export function InfoBoxButton(props: InfoBoxButtonProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { className, editorState, onChange: onEditorStateChange } = props

  const onChange = ({ title, rawContentState }) => {
    const contentState = editorState.getCurrentContent()

    // create an InfoBox entity
    const contentStateWithEntity = contentState.createEntity(
      'INFOBOX',
      'IMMUTABLE',
      {
        title,
        rawContentState,
        body: draftConverter.convertToHtml(rawContentState),
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    //The third parameter here is a space string, not an empty string
    //If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onEditorStateChange(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
    )
    setToShowInput(false)
  }

  return (
    <React.Fragment>
      <InfoBoxInput
        onChange={onChange}
        onCancel={() => {
          setToShowInput(false)
        }}
        isOpen={toShowInput}
      />
      <div
        className={className}
        onClick={() => {
          setToShowInput(true)
        }}
      >
        <i className="far"></i>
        <span>InfoBox</span>
      </div>
    </React.Fragment>
  )
}
