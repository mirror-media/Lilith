import React, { Fragment, useState } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'

import {
  ImageSelector as DefaultImageSelector,
  ImageSelectorOnChangeFn,
} from './selector/image-selector'
import type { ButtonProps } from './type'

type ImageButtonProps<T> = Pick<
  ButtonProps,
  'editorState' | 'onChange' | 'className'
> & {
  ImageSelector?: typeof DefaultImageSelector<T>
}

export function ImageButton<T>(props: ImageButtonProps<T>) {
  const {
    editorState,
    onChange,
    className,
    ImageSelector = DefaultImageSelector,
  } = props

  const [toShowImageSelector, setToShowImageSelector] = useState(false)

  const promptForImageSelector = () => {
    setToShowImageSelector(true)
  }

  const onImageSelectorChange: ImageSelectorOnChangeFn<T> = (
    selectedImages,
    align
  ) => {
    if (selectedImages.length === 0) {
      setToShowImageSelector(false)
    }

    let newEditorState = editorState
    for (const selectedImage of selectedImages) {
      const contentState = newEditorState.getCurrentContent()
      const contentStateWithEntity = contentState.createEntity(
        'image',
        'IMMUTABLE',
        {
          ...selectedImage.image,
          desc: selectedImage.desc,
          url: selectedImage.url,
          alignment: align,
        }
      )
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
      newEditorState = EditorState.set(newEditorState, {
        currentContent: contentStateWithEntity,
      })
      // The third parameter here is a space string, not an empty string
      // If you set an empty string, you will get an error: Unknown DraftEntity key: null
      newEditorState = AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        ' '
      )
    }

    onChange(newEditorState)
    setToShowImageSelector(false)
  }

  return (
    <Fragment>
      {toShowImageSelector && (
        <ImageSelector
          onChange={onImageSelectorChange}
          enableCaption={true}
          enableUrl={true}
          enableAlignment={true}
          enableMultiSelect={true}
        />
      )}

      <div className={className} onClick={promptForImageSelector}>
        <i className="far fa-image"></i>
        <span> Image</span>
      </div>
    </Fragment>
  )
}
