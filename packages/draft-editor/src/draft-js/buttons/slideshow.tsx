import React, { useState } from 'react'
import {
  ImageSelector as DefaultImageSelector,
  ImageEntityWithMeta,
} from './selector/image-selector'
import { AtomicBlockUtils, EditorState } from 'draft-js'

export function SlideshowButton(props: {
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

  const onImageSelectorChange = (
    selected: ImageEntityWithMeta[],
    align?: string,
    delay?: number
  ) => {
    if (selected.length === 0) {
      setToShowImageSelector(false)
      return
    }

    const contentState = editorState.getCurrentContent()

    // since 202206, only slideshow-v2 will be created
    const contentStateWithEntity = contentState.createEntity(
      'slideshow-v2',
      'IMMUTABLE',
      {
        alignment: align,
        delay,
        images: selected.map((ele) => {
          return {
            ...ele?.image,
            desc: ele?.desc,
          }
        }),
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
          enableDelay={true}
          enableMultiSelect={true}
        />
      )}
      <div className={className} onClick={promptForImageSelector}>
        <i className="far fa-images"></i>
        <span> Slideshow</span>
      </div>
    </React.Fragment>
  )
}
