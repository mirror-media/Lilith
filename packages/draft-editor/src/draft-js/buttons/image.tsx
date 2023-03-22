import React, { useState } from 'react'
import { AtomicBlockUtils, EditorState } from 'draft-js'

import { ImageSelector as DefaultImageSelector } from './selector/image-selector'

export function ImageButton(props: {
  editorState: EditorState
  onChange: (param: EditorState) => void
  className?: string
  ImageSelector: typeof DefaultImageSelector
}) {
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

  const onImageSelectorChange = (selectedImagesWithMeta, align) => {
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
        ...selected?.image,
        desc: selected?.desc,
        url: selected?.url,
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
    <React.Fragment>
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
    </React.Fragment>
  )
}
