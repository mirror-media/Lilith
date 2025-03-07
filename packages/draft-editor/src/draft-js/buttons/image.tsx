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
    selectedImagesWithMeta,
    align
  ) => {
    const selected = selectedImagesWithMeta?.[0]
    if (!selected) {
      setToShowImageSelector(false)
      return
    }

    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      'image',
      'IMMUTABLE',
      {
        ...selected.image,
        desc: selected.desc,
        url: selected.url,
        alignment: align,
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    })

    // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null
    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '))
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
        />
      )}

      <div className={className} onClick={promptForImageSelector}>
        <i className="far fa-image"></i>
        <span> Image</span>
      </div>
    </Fragment>
  )
}
