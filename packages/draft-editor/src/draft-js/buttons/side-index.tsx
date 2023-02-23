import React, { useState, useEffect } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { Button } from '@keystone-ui/button'
import styled from 'styled-components'
import {
  ImageSelector,
  ImageEntityWithMeta,
  ImageEntity,
} from './selector/image-selector'
import { TextInput } from '@keystone-ui/fields'

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin: 10px 0;
`

const ImageInputText = styled.span`
  display: inline-block;
  margin-right: 10px;
`

type SideIndexEntityData = {
  h2Text?: string
  sideIndexText?: string
  sideIndexUrl?: string
  sideIndexImage?: ImageEntity
}

export type SideIndexInputOnChange = (inputValue: SideIndexEntityData) => void

type SideIndexInputProps = SideIndexEntityData & {
  isOpen: boolean
  onChange: SideIndexInputOnChange
  onCancel: () => void
}

export function SideIndexInput(props: SideIndexInputProps) {
  const {
    isOpen,
    onChange,
    onCancel,
    h2Text,
    sideIndexText,
    sideIndexUrl,
    sideIndexImage,
  } = props

  const initialInputValue: SideIndexEntityData = {
    h2Text: h2Text || '',
    sideIndexText: sideIndexText || '',
    sideIndexUrl: sideIndexUrl || '',
    sideIndexImage: sideIndexImage || undefined,
  }

  const [inputValue, setInputValue] = useState(initialInputValue)
  const [toShowImageSelector, setToShowImageSelector] = useState(false)

  const onImageSelectorChange = (
    selectedImagesWithMeta: ImageEntityWithMeta[]
  ) => {
    const image = selectedImagesWithMeta?.[0]?.image
    if (!image) {
      setToShowImageSelector(false)
      return
    }

    setInputValue((oldInputValue) => ({
      ...oldInputValue,
      sideIndexImage: image,
    }))
    setToShowImageSelector(false)
  }

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
          title={`Insert Side Index`}
          actions={{
            cancel: {
              label: 'Cancel',
              action: () => {
                onCancel()
              },
            },
            confirm: {
              label: 'Confirm',
              action: () => {
                onChange({
                  ...inputValue,
                })
              },
            },
          }}
        >
          <Label>文內標題 (若填入外部連結則不會產生文章內h2)</Label>
          <TextInput
            onChange={(e) =>
              setInputValue((oldInputValue) => ({
                ...oldInputValue,
                h2Text: e.target.value,
              }))
            }
            type="text"
            placeholder="h2 text"
            value={inputValue.h2Text}
          />
          <Label>側欄標題 (Optional, 若未設定會直接用文內標題)</Label>
          <TextInput
            onChange={(e) =>
              setInputValue((oldInputValue) => ({
                ...oldInputValue,
                sideIndexText: e.target.value,
              }))
            }
            type="text"
            placeholder="sideindex text"
            value={inputValue.sideIndexText}
          />
          <Label>側欄 Url (Optional, 外部連結才需使用)</Label>
          <TextInput
            onChange={(e) =>
              setInputValue((oldInputValue) => ({
                ...oldInputValue,
                sideIndexUrl: e.target.value,
              }))
            }
            type="url"
            placeholder="sideindex url (optional)"
            value={inputValue.sideIndexUrl}
          />
          <Label>側欄圖片 (Optional)</Label>
          <div>
            <ImageInputText>
              {inputValue.sideIndexImage?.name
                ? inputValue.sideIndexImage.name
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
        </Drawer>
      </DrawerController>
    </>
  )
}

type SideIndexButtonProps = {
  className: string
  editorState: EditorState
  onChange: ({ editorState }: { editorState: EditorState }) => void
}

export function SideIndexButton(props: SideIndexButtonProps) {
  const [toShowInput, setToShowInput] = useState(false)
  const { className, editorState, onChange: onEditorStateChange } = props

  const onChange: SideIndexInputOnChange = ({
    h2Text,
    sideIndexText,
    sideIndexUrl,
    sideIndexImage,
  }) => {
    const contentState = editorState.getCurrentContent()

    // create an SideIndex entity
    const contentStateWithEntity = contentState.createEntity(
      'SIDEINDEX',
      'IMMUTABLE',
      {
        h2Text,
        sideIndexText,
        sideIndexUrl,
        sideIndexImage,
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
      <SideIndexInput
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
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.4626 0.211456H4.15859C3.93427 0.211456 3.71913 0.300569 3.56051 0.45919C3.40189 0.617811 3.31278 0.832947 3.31278 1.05727C3.31278 1.2816 3.40189 1.49673 3.56051 1.65535C3.71913 1.81397 3.93427 1.90309 4.15859 1.90309H13.4626C13.6866 1.90401 13.9012 1.99342 14.0596 2.15184C14.218 2.31027 14.3074 2.52486 14.3084 2.7489V13.4626C14.3074 13.6866 14.218 13.9012 14.0596 14.0596C13.9012 14.218 13.6866 14.3074 13.4626 14.3084H2.7489C2.52486 14.3074 2.31027 14.218 2.15184 14.0596C1.99342 13.9012 1.90401 13.6866 1.90309 13.4626V11.3093C1.90309 11.0849 1.81397 10.8698 1.65535 10.7112C1.49673 10.5526 1.2816 10.4634 1.05727 10.4634C0.832947 10.4634 0.617811 10.5526 0.45919 10.7112C0.300569 10.8698 0.211456 11.0849 0.211456 11.3093V13.4626C0.212389 14.1352 0.480025 14.7801 0.955687 15.2558C1.43135 15.7314 2.07622 15.9991 2.7489 16H13.4626C14.1352 15.9991 14.7801 15.7314 15.2558 15.2558C15.7314 14.7801 15.9991 14.1352 16 13.4626V2.7489C15.9991 2.07622 15.7314 1.43135 15.2558 0.955687C14.7801 0.480025 14.1352 0.212389 13.4626 0.211456Z"
            fill="#6b7280"
          />
          <path
            d="M1.05727 2.11454C1.64118 2.11454 2.11454 1.64118 2.11454 1.05727C2.11454 0.473355 1.64118 0 1.05727 0C0.473355 0 0 0.473355 0 1.05727C0 1.64118 0.473355 2.11454 1.05727 2.11454Z"
            fill="#6b7280"
          />
          <path
            d="M4.15859 5.48017H12.0529C12.2772 5.48017 12.4923 5.39106 12.6509 5.23244C12.8096 5.07382 12.8987 4.85868 12.8987 4.63436C12.8987 4.41003 12.8096 4.1949 12.6509 4.03628C12.4923 3.87766 12.2772 3.78854 12.0529 3.78854H4.15859C3.93427 3.78854 3.71913 3.87766 3.56051 4.03628C3.40189 4.1949 3.31277 4.41003 3.31277 4.63436C3.31277 4.85868 3.40189 5.07382 3.56051 5.23244C3.71913 5.39106 3.93427 5.48017 4.15859 5.48017Z"
            fill="#6b7280"
          />
          <path
            d="M1.05727 5.69162C1.64118 5.69162 2.11454 5.21827 2.11454 4.63436C2.11454 4.05044 1.64118 3.57709 1.05727 3.57709C0.473355 3.57709 0 4.05044 0 4.63436C0 5.21827 0.473355 5.69162 1.05727 5.69162Z"
            fill="#6b7280"
          />
          <path
            d="M4.15859 9.05726H12.0529C12.2772 9.05726 12.4923 8.96815 12.6509 8.80953C12.8096 8.65091 12.8987 8.43577 12.8987 8.21145C12.8987 7.98712 12.8096 7.77199 12.6509 7.61336C12.4923 7.45474 12.2772 7.36563 12.0529 7.36563H4.15859C3.93427 7.36563 3.71913 7.45474 3.56051 7.61336C3.40189 7.77199 3.31277 7.98712 3.31277 8.21145C3.31277 8.43577 3.40189 8.65091 3.56051 8.80953C3.71913 8.96815 3.93427 9.05726 4.15859 9.05726Z"
            fill="#6b7280"
          />
          <path
            d="M1.05727 9.26873C1.64118 9.26873 2.11454 8.79537 2.11454 8.21146C2.11454 7.62755 1.64118 7.15419 1.05727 7.15419C0.473355 7.15419 0 7.62755 0 8.21146C0 8.79537 0.473355 9.26873 1.05727 9.26873Z"
            fill="#6b7280"
          />
        </svg>
        <span>SideIndex</span>
      </div>
    </React.Fragment>
  )
}
