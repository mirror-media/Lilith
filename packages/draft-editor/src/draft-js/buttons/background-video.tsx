import React, { useState, useEffect } from 'react'
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
import { Button } from '@keystone-ui/button'
import draftConverter from '../editor/draft-converter'
import styled from 'styled-components'
import {
  VideoSelector as DefaultVideoSelector,
  VideoEntity,
  VideoEntityWithMeta,
} from './selector/video-selector'
import { AlignSelector } from './selector/align-selector'

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin: 10px 0;
`

const VideoInputText = styled.span`
  display: inline-block;
  margin-right: 10px;
`

type BGVideoInputOnChange = ({
  textBlockAlign,
  video,
  rawContentState,
}: {
  textBlockAlign: string
  video?: VideoEntity
  rawContentState: RawDraftContentState
}) => void

type BGVideoInputType = {
  textBlockAlign?: string
  video?: VideoEntity
  rawContentStateForBGVideoEditor?: RawDraftContentState
  isOpen: boolean
  onChange: BGVideoInputOnChange
  onCancel: () => void
  VideoSelector: typeof DefaultVideoSelector
}

export function BGVideoInput(props: BGVideoInputType) {
  const {
    isOpen,
    onChange,
    onCancel,
    textBlockAlign,
    video,
    rawContentStateForBGVideoEditor,
    VideoSelector = DefaultVideoSelector,
  } = props
  const rawContentState = rawContentStateForBGVideoEditor || {
    blocks: [],
    entityMap: {},
  }
  const options = [
    { value: 'fixed', label: 'fixed (default)', isDisabled: false },
    { value: 'bottom', label: 'bottom', isDisabled: false },
    { value: 'left', label: 'left', isDisabled: false },
    { value: 'right', label: 'right', isDisabled: false },
  ]
  const initialInputValue: {
    textBlockAlign: string
    video?: VideoEntity
    editorStateOfBasicEditor: EditorState
  } = {
    textBlockAlign: textBlockAlign || 'fixed',
    video: video || undefined,
    // create an `editorState` from raw content state object
    editorStateOfBasicEditor: EditorState.createWithContent(
      convertFromRaw(rawContentState),
      decorators
    ),
  }

  const [inputValue, setInputValue] = useState(initialInputValue)
  const [toShowVideoSelector, setToShowVideoSelector] = useState(false)

  const clearInputValue = () => {
    setInputValue((oldInputValue) => ({
      ...oldInputValue,
      editorStateOfBasicEditor: EditorState.createWithContent(
        convertFromRaw({
          blocks: [],
          entityMap: {},
        }),
        decorators
      ),
    }))
  }

  const onVideoSelectorChange = (
    selectedVideosWithMeta: VideoEntityWithMeta[]
  ) => {
    const video = selectedVideosWithMeta?.[0]?.video
    if (!video) {
      setToShowVideoSelector(false)
      return
    }

    setInputValue((oldInputValue) => ({
      ...oldInputValue,
      video: video,
    }))
    setToShowVideoSelector(false)
  }

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialInputValue)
    }
  }, [isOpen])

  return (
    <>
      {toShowVideoSelector && (
        <VideoSelector onChange={onVideoSelectorChange} />
      )}
      <DrawerController isOpen={isOpen}>
        <Drawer
          title={`Insert Background Video`}
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
                  textBlockAlign: inputValue.textBlockAlign,
                  video: inputValue.video,
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
          <Label>影片</Label>
          <div>
            <VideoInputText>
              {inputValue.video?.name ? inputValue.video.name : '尚未選取影片'}
            </VideoInputText>
            <Button
              type="button"
              onClick={() => setToShowVideoSelector(true)}
              tone="passive"
            >
              添加影片
            </Button>
          </div>
          <AlignSelector
            align={inputValue.textBlockAlign}
            options={options}
            onChange={(textBlockAlign) => {
              setInputValue((oldInputValue) => ({
                ...oldInputValue,
                textBlockAlign,
              }))
            }}
          />
          <Label>內文</Label>
          <BasicEditor
            editorState={inputValue.editorStateOfBasicEditor}
            onChange={(editorStateOfBasicEditor) => {
              setInputValue((oldInputValue) => ({
                ...oldInputValue,
                editorStateOfBasicEditor,
              }))
            }}
          />
        </Drawer>
      </DrawerController>
    </>
  )
}

type BGVideoButtonProps = {
  className: string
  editorState: EditorState
  onChange: ({ editorState }: { editorState: EditorState }) => void
  VideoSelector: typeof DefaultVideoSelector
}

export function BGVideoButton(props: BGVideoButtonProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const {
    className,
    editorState,
    onChange: onEditorStateChange,
    VideoSelector,
  } = props

  const onChange: BGVideoInputOnChange = ({
    textBlockAlign,
    video,
    rawContentState,
  }) => {
    const contentState = editorState.getCurrentContent()

    // create an BGVideo entity
    const contentStateWithEntity = contentState.createEntity(
      'BACKGROUNDVIDEO',
      'IMMUTABLE',
      {
        textBlockAlign,
        video,
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
      <BGVideoInput
        onChange={onChange}
        onCancel={() => {
          setToShowInput(false)
        }}
        isOpen={toShowInput}
        VideoSelector={VideoSelector}
      />
      <div
        className={className}
        onClick={() => {
          setToShowInput(true)
        }}
      >
        <svg
          width="16"
          height="10"
          viewBox="0 0 16 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.6667 1.25V8.75C10.6667 9.44036 10.0697 10 9.33333 10H1.33333C0.596944 10 0 9.44036 0 8.75V1.25C0 0.559635 0.596944 0 1.33333 0H9.33333C10.0694 0 10.6667 0.559635 10.6667 1.25ZM16 1.65365V8.34375C16 9.00781 15.1897 9.39557 14.6003 9.01536L11.5556 7.04948V2.95052L14.6 0.982812C15.1917 0.602344 16 0.992188 16 1.65365Z"
            fill="#6b7280"
          />
        </svg>
        <span>Background Video</span>
      </div>
    </React.Fragment>
  )
}
