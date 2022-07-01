import React, { useState } from 'react'
import axios from 'axios'
import debounce from 'lodash/debounce'
import errors from '@twreporter/errors'

import { AlertDialog } from '@keystone-ui/modals'
import { Button } from '@keystone-ui/button'
import { TextInput } from '@keystone-ui/fields'

import { AtomicBlockUtils, DraftEntityInstance, EditorState } from 'draft-js'

const _ = {
  debounce,
}

const styles = {
  imagesGrid: {
    display: 'flex',
  },
  image: {
    width: '100%',
  },
  imageItem: {
    width: '100px',
    cursor: 'pointer',
  },
  searchBox: {
    display: 'flex',
  },
  buttons: {
    marginBottom: 10,
    display: 'flex',
  },
  button: {
    marginTop: '10px',
    marginRight: '10px',
    cursor: 'pointer',
  },
  separationLine: {
    border: '#e1e5e9 1px solid',
    marginTop: '10px',
    marginBottom: '10px',
  },
}

type ID = string

type ImageEntity = {
  id: ID
  name?: string
  imageFile: {
    url: string
  }
  resized: {
    original: string
  }
}

export type ImageEntityWithDesc = {
  image: ImageEntity
  desc: string
}

async function fetchImagesFromGraphQL({
  searchText,
  apiUrl = '/api/graphql',
}: {
  searchText: string
  apiUrl?: string
}): Promise<ImageEntity[]> {
  // TODO: add pagination if needed
  // TODO: fetch other resized targets, such as w800, when resizing function is ready
  const query = `
query {
  photos (where: {name:{contains: "${searchText}"}}) {
    id
    name
    imageFile {
      url
    }
    resized {
      original
    }
  }
}
`
  try {
    const results = await axios.post(apiUrl, {
      query,
    })
    const gqlErrors = results.data?.errors

    if (gqlErrors) {
      const annotatingError = errors.helpers.wrap(
        new Error('Errors occurs in the GraphQL returned value'),
        'GraphQLError',
        'Errors occurs in `images` query',
        {
          errors: gqlErrors,
          query,
        }
      )
      throw annotatingError
    }

    return results.data?.data?.photos
  } catch (axiosError) {
    const annotatingError = errors.helpers.annotateAxiosError(axiosError)
    throw annotatingError
  }
}

type ImageItemOnSelectFn = (param: ImageEntity) => void

function ImageItem(props: {
  image: ImageEntity
  isSelected: boolean
  onSelect: ImageItemOnSelectFn
}) {
  const { image, onSelect, isSelected } = props
  return (
    <div
      style={styles.imageItem}
      key={image?.id}
      onClick={() => onSelect(image)}
    >
      <div>{isSelected ? <i className="fas fa-check-circle"></i> : null}</div>
      <img
        style={styles.image}
        src={image?.resized?.original}
        onError={(e) => (e.currentTarget.src = image?.imageFile?.url)}
      />
    </div>
  )
}

function ImagesGrid(props: {
  images: ImageEntity[]
  selected: ImageEntity[]
  onSelect: ImageItemOnSelectFn
}): React.ReactElement {
  const { images, selected, onSelect } = props

  return (
    <div style={styles.imagesGrid}>
      {images.map((image) => {
        return (
          <ImageItem
            key={image.id}
            isSelected={selected?.includes(image)}
            onSelect={() => onSelect(image)}
            image={image}
          />
        )
      })}
    </div>
  )
}

type SearchBoxOnChangeFn = (param: string) => void

function SearchBox(props: {
  onChange: SearchBoxOnChangeFn
}): React.ReactElement {
  const { onChange } = props
  const [searchInput, setSearchInput] = useState('')

  return (
    <div style={styles.searchBox}>
      <TextInput
        type="text"
        placeholder="請輸入關鍵字搜尋"
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value)
        }}
      ></TextInput>

      <Button
        onClick={() => {
          onChange(searchInput)
        }}
      >
        Search
      </Button>
    </div>
  )
}

type ImageDescInputOnChangeFn = (params: ImageEntityWithDesc) => void

function ImageDescInput(
  props: ImageEntityWithDesc & { onChange: ImageDescInputOnChangeFn }
): React.ReactElement {
  const { image, desc, onChange } = props

  return (
    <div style={styles.imageItem}>
      <img
        style={styles.image}
        src={image?.resized?.original}
        onError={(e) => (e.currentTarget.src = image?.imageFile?.url)}
      />
      <TextInput
        type="text"
        placeholder={image?.name}
        defaultValue={desc}
        onChange={_.debounce((e) => {
          onChange({
            image,
            desc: e.target.value,
          })
        })}
      ></TextInput>
    </div>
  )
}

type ImageSelectorOnChangeFn = (params: ImageEntityWithDesc[]) => void

export function ImageSelector(props: {
  isOpen: boolean
  enableMultipleSelect?: boolean
  onChange: ImageSelectorOnChangeFn
}) {
  const [selected, setSelected]: [
    ImageEntityWithDesc[],
    (params: ImageEntityWithDesc[]) => void
  ] = useState([])
  const [images, setImages] = useState([])
  const [error, setError] = useState(null)

  const { isOpen, enableMultipleSelect = false, onChange } = props

  const onSave = () => {
    onChange(selected)
    setSelected([])
    setImages([])
    setError(null)
  }

  const onCancel = () => {
    onChange([])
    setSelected([])
    setImages([])
    setError(null)
  }

  const onSearchBoxChange: SearchBoxOnChangeFn = async (searchInput) => {
    try {
      const images = await fetchImagesFromGraphQL({ searchText: searchInput })
      setImages(images)
      setError(null)
    } catch (e) {
      setError(e)
    }
  }

  const onImageDescInputChange: ImageDescInputOnChangeFn = (
    imageEntityWithDesc
  ) => {
    if (enableMultipleSelect) {
      const foundIndex = selected.findIndex(
        (ele) => ele?.image?.id === imageEntityWithDesc?.image?.id
      )
      if (foundIndex !== -1) {
        selected[foundIndex] = imageEntityWithDesc
        setSelected(selected)
      }
      return
    }
    setSelected([imageEntityWithDesc])
  }

  const onImagesGridSelect: ImageItemOnSelectFn = (imageEntity) => {
    const found = selected.find((ele) => ele?.image?.id === imageEntity.id)
    if (found) {
      return
    }
    if (enableMultipleSelect) {
      return setSelected(selected.concat([{ image: imageEntity, desc: '' }]))
    }
    return setSelected([{ image: imageEntity, desc: '' }])
  }

  const selectedImages = selected.map((ele: ImageEntityWithDesc) => {
    return ele.image
  })

  return (
    <AlertDialog
      title="Select image"
      isOpen={isOpen}
      actions={{
        cancel: {
          label: 'Cancel',
          action: onCancel,
        },
        confirm: {
          label: 'Confirm',
          action: onSave,
        },
      }}
    >
      <div className="ImageSelector Selector">
        <div className="Selector__container">
          <div>
            <SearchBox onChange={onSearchBoxChange} />
            {error ? (
              <div>
                {errors.helpers.printAll(error, {
                  withStack: true,
                  withPayload: true,
                })}
              </div>
            ) : (
              <ImagesGrid
                images={images}
                selected={selectedImages}
                onSelect={onImagesGridSelect}
              />
            )}
          </div>
          <div style={styles.separationLine} />
          <div style={styles.imagesGrid}>
            {selected.map((imageWithDesc) => {
              return (
                <ImageDescInput
                  key={imageWithDesc?.image?.id}
                  image={imageWithDesc?.image}
                  desc={imageWithDesc.desc}
                  onChange={onImageDescInputChange}
                />
              )
            })}
          </div>
        </div>
      </div>
    </AlertDialog>
  )
}

export function ImageBlock(entity: DraftEntityInstance) {
  const { desc, imageFile, resized } = entity.getData()
  return (
    <figure>
      <img
        style={styles.image}
        src={resized?.original}
        onError={(e) => (e.currentTarget.src = imageFile?.url)}
      />
      <figcaption>{desc}</figcaption>
    </figure>
  )
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

  const onImageSelectorChange = (selectedImagesWithDesc) => {
    const selected = selectedImagesWithDesc?.[0]
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
      <ImageSelector
        isOpen={toShowImageSelector}
        onChange={onImageSelectorChange}
      />

      <div className={className} onClick={promptForImageSelector}>
        <i className="far fa-image"></i>
        <span> Image</span>
      </div>
    </React.Fragment>
  )
}
