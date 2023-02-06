import React, { useState } from 'react'
import { ImageSelector, ImageEntityWithMeta } from './shared/image-selector'
import { AtomicBlockUtils, DraftEntityInstance, EditorState } from 'draft-js'
import styled from 'styled-components'

const Image = styled.img`
  width: 100%;
`

const SlideshowCount = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 100%;
  border: black 1px solid;
  transform: translate(-50%, -50%);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  aspect-ratio: 1;
  min-height: 66px;
  padding: 10px;
`

const Figure = styled.figure`
  position: relative;
  margin-block: unset;
  margin-inline: unset;
  margin: 0 10px;
`
// support old version of slideshow without delay propertiy
export function SlideshowBlock(entity: DraftEntityInstance) {
  const images = entity.getData()
  return (
    <Figure>
      <Image
        src={images?.[0]?.resized?.original}
        onError={(e) => (e.currentTarget.src = images?.[0]?.imageFile?.url)}
      />
      <SlideshowCount>+{images.length}</SlideshowCount>
    </Figure>
  )
}

export function SlideshowButton(props: {
  editorState: EditorState
  onChange: (param: EditorState) => void
  className?: string
}) {
  const { editorState, onChange, className } = props

  const [toShowImageSelector, setToShowImageSelector] = useState(false)

  const promptForImageSelector = () => {
    setToShowImageSelector(true)
  }

  const onImageSelectorChange = (selected: ImageEntityWithMeta[]) => {
    if (selected.length === 0) {
      setToShowImageSelector(false)
      return
    }

    const contentState = editorState.getCurrentContent()

    // since 202206, only slideshow-v2 will be created
    const contentStateWithEntity = contentState.createEntity(
      'slideshow',
      'IMMUTABLE',
      selected.map((ele) => {
        return {
          ...ele?.image,
          desc: ele?.desc,
        }
      })
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
          enableDelay={false}
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
