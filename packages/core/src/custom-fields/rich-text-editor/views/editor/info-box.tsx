import React, { useState } from 'react'
import decorators from './entity-decorator'
import {
  AtomicBlockUtils,
  ContentBlock,
  ContentState,
  EditorState,
  RawDraftContentState,
  convertToRaw,
  convertFromRaw,
} from 'draft-js'
import { BasicEditor } from './basic-editor'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { TextInput } from '@keystone-ui/fields'
import draftConverter from '../../draft-to-api-data/draft-converter'

type InfoBoxBlockProps = {
  block: ContentBlock
  blockProps: {
    onEditStart: () => void
    onEditFinish: ({
      entityKey,
      entityData,
    }: {
      entityKey?: string
      entityData?: Record<string, unknown>
    }) => void
  }
  contentState: ContentState
}

export function InfoBoxBlock(props: InfoBoxBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { title, body, rawContentState } = entity.getData()
  const onChange = ({
    title: newTitle,
    rawContentState: newRawContentState,
  }) => {
    // close `InfoBoxInput`
    setToShowInput(false)

    onEditFinish({
      entityKey,
      entityData: {
        title: newTitle,
        body: draftConverter.convertToHtml(newRawContentState),
        rawContentState: newRawContentState,
      },
    })
  }

  return (
    <React.Fragment>
      <InfoBoxInput
        title={title}
        rawContentStateForInfoBoxEditor={rawContentState}
        onChange={onChange}
        onCancel={() => {
          onEditFinish({})
          setToShowInput(false)
        }}
        isOpen={toShowInput}
      />
      <div
        style={{
          backgroundColor: '#F5F4F3',
          padding: '30px',
          position: 'relative',
        }}
      >
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{ __html: body }} />
        <div
          onClick={() => {
            // call `onEditStart` prop as we are trying to update the InfoBox entity
            onEditStart()
            // open `InfoBoxInput`
            setToShowInput(true)
          }}
          style={{ cursor: 'pointer' }}
        >
          <i className="fa-solid fa-pen"></i>
          <span>Modify</span>
        </div>
      </div>
    </React.Fragment>
  )
}

type InfoBoxInputType = {
  title?: string
  rawContentStateForInfoBoxEditor?: RawDraftContentState
  isOpen: boolean
  onChange: ({ title: string, rawContentState: RawDraftContentState }) => void
  onCancel: () => void
}

function InfoBoxInput(props: InfoBoxInputType) {
  const { isOpen, onChange, onCancel, title, rawContentStateForInfoBoxEditor } =
    props
  const rawContentState = rawContentStateForInfoBoxEditor || {
    blocks: [],
    entityMap: {},
  }

  const [inputValue, setInputValue] = useState({
    title: title || '',
    // create an `editorState` from raw content state object
    editorStateOfBasicEditor: EditorState.createWithContent(
      convertFromRaw(rawContentState),
      decorators
    ),
  })

  return (
    <DrawerController isOpen={isOpen}>
      <Drawer
        title={`Insert Info Box`}
        actions={{
          cancel: {
            label: 'Cancel',
            action: onCancel,
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
            },
          },
        }}
      >
        <TextInput
          onChange={(e) =>
            setInputValue({
              title: e.target.value,
              editorStateOfBasicEditor: inputValue.editorStateOfBasicEditor,
            })
          }
          type="text"
          placeholder="Title"
          value={inputValue.title}
          style={{ marginTop: '30px', marginBottom: '10px' }}
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
  onChange: ({ editorState: EditorState }) => void
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
