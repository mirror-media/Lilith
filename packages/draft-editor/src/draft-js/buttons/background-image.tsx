import React, { Fragment, useState, useEffect } from 'react'
import {
  AtomicBlockUtils,
  EditorState,
  RawDraftContentState,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
} from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { Button } from '@keystone-ui/button'
import draftConverter from '../draft-converter'
import styled from 'styled-components'
import {
  ImageSelector as DefaultImageSelector,
  ImageEntity,
  ImageEntityWithMeta,
} from './selector/image-selector'
import { AlignSelector } from './selector/align-selector'
import type { ButtonProps } from './type'

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin: 10px 0;
`

const ImageInputText = styled.span`
  display: inline-block;
  margin-right: 10px;
`

export type RenderBasicEditor = (propsOfBasicEditor: {
  onChange: (es: EditorState) => void
  editorState: EditorState
}) => React.ReactElement

type BGImageInputOnChange<T> = ({
  textBlockAlign,
  image,
  rawContentState,
}: {
  textBlockAlign: string
  image?: T
  rawContentState: RawDraftContentState
}) => void

type BGImageInputType<T> = {
  textBlockAlign?: string
  image?: T
  rawContentStateForBGImageEditor?: RawDraftContentState
  isOpen: boolean
  onChange: BGImageInputOnChange<T>
  onCancel: () => void
  ImageSelector?: typeof DefaultImageSelector<T>
  renderBasicEditor: RenderBasicEditor
  decorators?: CompositeDecorator
}

export function BGImageInput<T>(props: BGImageInputType<T>) {
  const {
    isOpen,
    onChange,
    onCancel,
    textBlockAlign,
    image,
    rawContentStateForBGImageEditor,
    ImageSelector = DefaultImageSelector,
    renderBasicEditor,
    decorators,
  } = props

  const rawContentState = rawContentStateForBGImageEditor || {
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
    image?: T
    editorStateOfBasicEditor: EditorState
  } = {
    textBlockAlign: textBlockAlign || 'fixed',
    image: image || undefined,
    // create an `editorState` from raw content state object
    editorStateOfBasicEditor: EditorState.createWithContent(
      convertFromRaw(rawContentState),
      decorators
    ),
  }

  const [inputValue, setInputValue] = useState(initialInputValue)
  const [toShowImageSelector, setToShowImageSelector] = useState(false)

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

  const onImageSelectorChange = (
    selectedImagesWithMeta: ImageEntityWithMeta<T>[]
  ) => {
    const image = selectedImagesWithMeta?.[0]?.image
    if (!image) {
      setToShowImageSelector(false)
      return
    }

    setInputValue((oldInputValue) => ({
      ...oldInputValue,
      image: image,
    }))
    setToShowImageSelector(false)
  }

  const basicEditorJsx = renderBasicEditor({
    editorState: inputValue.editorStateOfBasicEditor,
    onChange: (editorStateOfBasicEditor: EditorState) => {
      setInputValue((oldInputValue) => ({
        ...oldInputValue,
        editorStateOfBasicEditor,
      }))
    },
  })

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialInputValue)
    }
  }, [isOpen])

  return (
    <>
      {toShowImageSelector && (
        <ImageSelector onChange={onImageSelectorChange} />
      )}
      <DrawerController isOpen={isOpen}>
        <Drawer
          title={`Insert Background Image`}
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
                  image: inputValue.image,
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
          <Label>圖片</Label>
          <div>
            <ImageInputText>
              {(inputValue.image as ImageEntity)?.name
                ? (inputValue.image as ImageEntity).name
                : '尚未選取圖片'}
            </ImageInputText>
            <Button
              type="button"
              onClick={() => setToShowImageSelector(true)}
              tone="passive"
            >
              添加圖片
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
          {basicEditorJsx}
        </Drawer>
      </DrawerController>
    </>
  )
}

type BGImageButtonProps<T> = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
> & {
  ImageSelector?: typeof DefaultImageSelector<T>
  renderBasicEditor: RenderBasicEditor
  decorators?: CompositeDecorator
}

export function BGImageButton<T>(props: BGImageButtonProps<T>) {
  const [toShowInput, setToShowInput] = useState(false)
  const {
    className,
    editorState,
    onChange: onEditorStateChange,
    ImageSelector,
    renderBasicEditor,
    decorators,
  } = props

  const onChange: BGImageInputOnChange<T> = ({
    textBlockAlign,
    image,
    rawContentState,
  }) => {
    const contentState = editorState.getCurrentContent()

    // create an BGImage entity
    const contentStateWithEntity = contentState.createEntity(
      'BACKGROUNDIMAGE',
      'IMMUTABLE',
      {
        textBlockAlign,
        image,
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
    <Fragment>
      <BGImageInput
        renderBasicEditor={renderBasicEditor}
        onChange={onChange}
        onCancel={() => {
          setToShowInput(false)
        }}
        isOpen={toShowInput}
        ImageSelector={ImageSelector}
        decorators={decorators}
      />
      <div
        className={className}
        onClick={() => {
          setToShowInput(true)
        }}
      >
        <svg
          width="16"
          height="14"
          viewBox="0 0 16 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.42974 10.2188C7.01697 9.80208 6.81059 9.29167 6.81059 8.6875C6.81059 8.08333 7.02783 7.57292 7.46232 7.15625C7.89681 6.73958 8.41819 6.53125 9.02648 6.53125C9.65648 6.53125 10.1887 6.73958 10.6232 7.15625C11.0577 7.57292 11.2749 8.08333 11.2749 8.6875C11.2749 9.27083 11.0577 9.77083 10.6232 10.1875C10.1887 10.6042 9.65648 10.8125 9.02648 10.8125C8.39647 10.8125 7.86422 10.6146 7.42974 10.2188ZM6.58248 11.0312C7.25594 11.6771 8.0706 12 9.02648 12C9.98235 12 10.797 11.6771 11.4705 11.0312C12.1656 10.3854 12.5132 9.60417 12.5132 8.6875C12.5132 7.77083 12.1656 6.98958 11.4705 6.34375C10.797 5.67708 9.98235 5.34375 9.02648 5.34375C8.0706 5.34375 7.25594 5.67708 6.58248 6.34375C5.90903 6.98958 5.5723 7.77083 5.5723 8.6875C5.5723 9.60417 5.90903 10.3854 6.58248 11.0312ZM4.17108 6V4H6.25662V2H11.112L12.3829 3.34375H14.5988C14.9681 3.34375 15.294 3.47917 15.5764 3.75C15.8588 4.02083 16 4.33333 16 4.6875V12.6875C16 13.0417 15.8588 13.3542 15.5764 13.625C15.294 13.875 14.9681 14 14.5988 14H3.48676C3.11745 14 2.79158 13.875 2.50916 13.625C2.22675 13.3542 2.08554 13.0417 2.08554 12.6875V6H4.17108ZM2.08554 2V0H3.48676V2H5.5723V3.34375H3.48676V5.34375H2.08554V3.34375H0V2H2.08554Z"
            fill="#6b7280"
          />
        </svg>
        <span>Background Image</span>
      </div>
    </Fragment>
  )
}
