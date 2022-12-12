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
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { TextInput } from '@keystone-ui/fields'
import draftConverter from '../../draft-to-api-data/draft-converter'

type RenderBasicEditor = (propsOfBasicEditor: {
  onChange: (es: EditorState) => void
  editorState: EditorState
}) => React.ReactElement

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
  renderBasicEditor: RenderBasicEditor
}

export function InfoBoxBlock(props: InfoBoxBlockProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { block, blockProps, contentState } = props
  const { onEditStart, onEditFinish, renderBasicEditor } = blockProps
  const entityKey = block.getEntityAt(0)
  const entity = contentState.getEntity(entityKey)
  const { title, body, rawContentState } = entity.getData()
  const onChange = ({
    title: newTitle,
    rawContentState: newRawContentState,
  }: {
    title: string
    rawContentState: RawDraftContentState
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
        renderBasicEditor={renderBasicEditor}
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
  onChange: (props: {
    title: string
    rawContentState: RawDraftContentState
  }) => void
  onCancel: () => void
  renderBasicEditor: RenderBasicEditor
}

function InfoBoxInput(props: InfoBoxInputType) {
  const {
    isOpen,
    onChange,
    onCancel,
    title,
    rawContentStateForInfoBoxEditor,
    renderBasicEditor,
  } = props
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
  const basicEditorJsx = renderBasicEditor({
    editorState: inputValue.editorStateOfBasicEditor,
    onChange: (editorStateOfBasicEditor: EditorState) => {
      setInputValue({
        title: inputValue.title,
        editorStateOfBasicEditor,
      })
    },
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
        {basicEditorJsx}
      </Drawer>
    </DrawerController>
  )
}

type InfoBoxButtonProps = {
  className: string
  editorState: EditorState
  onChange: (editorState: EditorState) => void
  renderBasicEditor: RenderBasicEditor
}

export function InfoBoxButton(props: InfoBoxButtonProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const {
    className,
    editorState,
    onChange: onEditorStateChange,
    renderBasicEditor,
  } = props

  const onChange = ({
    title,
    rawContentState,
  }: {
    title: string
    rawContentState: RawDraftContentState
  }) => {
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
        renderBasicEditor={renderBasicEditor}
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
