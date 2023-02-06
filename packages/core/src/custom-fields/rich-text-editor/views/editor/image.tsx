import React, { useState } from 'react'
import styled from 'styled-components'
import { AtomicBlockUtils, DraftEntityInstance, EditorState } from 'draft-js'

import { ImageSelector } from './shared/image-selector'

const Image = styled.img`
  width: 100%;
`

const Figure = styled.figure`
  margin-block: unset;
  margin-inline: unset;
  margin: 0 10px;
`

const Anchor = styled.a`
  text-decoration: none;
`

export function ImageBlock(entity: DraftEntityInstance) {
  const { desc, imageFile, resized, url } = entity.getData()

  let imgBlock = (
    <Figure>
      <Image
        src={resized?.original}
        onError={(e) => (e.currentTarget.src = imageFile?.url)}
      />
      <figcaption>{desc}</figcaption>
    </Figure>
  )

  if (url) {
    imgBlock = (
      <Anchor href={url} target="_blank">
        {imgBlock}
      </Anchor>
    )
  }

  return imgBlock
}

export function ImageButton(props: {
  editorState: EditorState
  onChange: (param: EditorState) => void
  className?: string
}) {
  const { editorState, onChange, className } = props

  const [toShowImageSelector, setToShowImageSelector] = useState(false)

  const promptForImageSelector = () => {
    setToShowImageSelector(true)
  }

  const onImageSelectorChange = (selectedImagesWithMeta) => {
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
          enableUrl={false}
          enableAlignment={false}
        />
      )}
      <div className={className} onClick={promptForImageSelector}>
        <i className="far fa-image"></i>
        <span> Image</span>
      </div>
    </React.Fragment>
  )
}
