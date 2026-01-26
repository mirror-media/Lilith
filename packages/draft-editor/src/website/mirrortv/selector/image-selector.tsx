import React, { Fragment, useState, useEffect, useRef } from 'react'
import debounce from 'lodash/debounce'
import styled, { createGlobalStyle } from 'styled-components'
import { TextInput } from '@keystone-ui/fields'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo'
import { AlignSelector } from './align-selector'
import { SearchBox, SearchBoxOnChangeFn } from './search-box'
import { Pagination } from './pagination'
import { Button } from '@keystone-ui/button'
import { ImageUploader, ImageUploaderOnChangeFn } from './image-uploader'

const imagesQuery = gql`
  query Images($searchText: String!, $take: Int, $skip: Int) {
    imagesCount(where: { name: { contains: $searchText } })
    images(
      where: { name: { contains: $searchText } }
      orderBy: { id: desc }
      take: $take
      skip: $skip
    ) {
      id
      name
      file {
        url
        width
        height
      }
      resized {
        original
        w480
        w800
        w1200
        w1600
        w2400
      }
      resizedWebp {
        original
        w480
        w800
        w1200
        w1600
        w2400
      }
    }
  }
`

const _ = {
  debounce,
}

const GlobalStyle = createGlobalStyle`
  form {
    @media (max-width: 575px) {
      width: 100vw !important;
    }
  }
`

const ImageSearchBox = styled(SearchBox)`
  margin-top: 10px;
`

const CustomButton = styled(Button)`
  margin-top: 10px;
`

const ImageSelectionWrapper = styled.div`
  overflow: auto;
  margin-top: 10px;
`
const ImageBlockMetaWrapper = styled.div``

const ImageGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  margin-top: 5px;
`

const ImageGridWrapper = styled.div`
  width: 33.3333%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const ImageMetaGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const ImageMetaGridWrapper = styled.div`
  width: 100%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const Image = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 2;
  object-fit: cover;
`

const Label = styled.label`
  display: block;
  margin: 10px 0;
  font-weight: 600;
`

const StyledTextInput = styled(TextInput)`
  width: 100%;
`

const SeparationLine = styled.div`
  border: #e1e5e9 1px solid;
  margin-top: 10px;
  margin-bottom: 10px;
`

const ImageSelected = styled.div`
  height: 1.4rem;
`

const ErrorWrapper = styled.div`
  & * {
    margin: 0;
  }
`

const ImageName = styled.p`
  text-align: center;
`

type ID = string

export type ImageEntityImageFile = {
  url: string
  width: number
  height: number
}

export type ImageEntityResized = {
  original: string
  w480: string
  w800: string
  w1200: string
  w1600: string
  w2400: string
}

export type ImageEntity = {
  id: ID
  name?: string
  file: {
    url: string
    width: number
    height: number
  }
  resized: ImageEntityResized
  resizedWebp: ImageEntityResized
}

export type ImageEntityWithMeta = {
  image: ImageEntity
  desc?: string
  url?: string
}

type ImageEntityOnSelectFn = (param: ImageEntity) => void

function ImageGrids(props: {
  images: ImageEntity[]
  selected: ImageEntity[]
  onSelect: ImageEntityOnSelectFn
}): React.ReactElement {
  const { images, selected, onSelect } = props

  return (
    <ImageGridsWrapper>
      {images.map((image) => {
        return (
          <ImageGrid
            key={image.id}
            isSelected={
              !!selected?.find((selectedImage) => selectedImage.id === image.id)
            }
            onSelect={() => onSelect(image)}
            image={image}
          />
        )
      })}
    </ImageGridsWrapper>
  )
}

function ImageGrid(props: {
  image: ImageEntity
  isSelected: boolean
  onSelect: ImageEntityOnSelectFn
}) {
  const { image, onSelect, isSelected } = props
  const initialSrc = image?.resized?.w800 || image?.file?.url

  return (
    <ImageGridWrapper key={image?.id} onClick={() => onSelect(image)}>
      <ImageSelected>
        {isSelected ? <i className="fas fa-check-circle" style={{ color: '#007bff' }}></i> : null}
      </ImageSelected>
      <Image
        src={initialSrc}
        onError={(e) => {
          if (image?.file?.url && e.currentTarget.src !== image.file.url) {
            e.currentTarget.src = image.file.url
          }
        }}
      />
    </ImageGridWrapper>
  )
}

type ImageMetaOnChangeFn = (params: ImageEntityWithMeta) => void

function ImageMetaGrids(props: {
  imageMetas: ImageEntityWithMeta[]
  onChange: ImageMetaOnChangeFn
  enableCaption: boolean
  enableUrl: boolean
}) {
  const { imageMetas, onChange, enableCaption, enableUrl } = props
  return (
    <ImageMetaGridsWrapper>
      {imageMetas.map((imageMeta) => (
        <ImageMetaGrid
          key={imageMeta?.image?.id}
          imageMeta={imageMeta}
          enableCaption={enableCaption}
          enableUrl={enableUrl}
          onChange={onChange}
        />
      ))}
    </ImageMetaGridsWrapper>
  )
}

function ImageMetaGrid(props: {
  imageMeta: ImageEntityWithMeta
  onChange: (params: ImageEntityWithMeta) => void
  enableCaption: boolean
  enableUrl: boolean
}): React.ReactElement {
  const { imageMeta, enableCaption, enableUrl, onChange } = props
  const { image, desc, url } = imageMeta
  const src = image?.resized?.w800 || image?.file?.url

  return (
    <ImageMetaGridWrapper>
      <Image
        src={src}
        onError={(e) => {
          if (image?.file?.url && e.currentTarget.src !== image.file.url) {
            e.currentTarget.src = image.file.url
          }
        }}
      />
      <ImageName style={{ textAlign: 'left' }}>{image?.name}</ImageName>
      {enableCaption && (
        <Fragment>
          <Label htmlFor="caption">Image Caption:</Label>
          <TextInput
            id="caption"
            type="text"
            placeholder={image?.name}
            defaultValue={desc}
            onChange={_.debounce((e) => {
              onChange({ image, desc: e.target.value, url })
            }, 300)}
          />
        </Fragment>
      )}
      {enableUrl && (
        <Fragment>
          <Label htmlFor="url">Url:</Label>
          <TextInput
            id="url"
            type="text"
            placeholder="(Optional)"
            defaultValue={url}
            onChange={_.debounce((e) => {
              onChange({ image, desc, url: e.target.value })
            }, 300)}
          />
        </Fragment>
      )}
    </ImageMetaGridWrapper>
  )
}

type DelayInputOnChangeFn = (param: string) => void

function DelayInput(props: {
  delay: string | number
  onChange: DelayInputOnChangeFn
}): React.ReactElement {
  const { delay, onChange } = props

  return (
    <Fragment>
      <Label>Slideshow delay:</Label>
      <TextInput
        type="number"
        placeholder="請輸入自動切換秒數"
        step="0.5"
        min="1"
        value={delay}
        onChange={(e) => {
          onChange(e.target.value)
        }}
      />
    </Fragment>
  )
}

export type ImageSelectorOnChangeFn = (
  params: ImageEntityWithMeta[],
  align?: string,
  delay?: number
) => void

export function ImageSelector(props: {
  enableMultiSelect?: boolean
  enableCaption?: boolean
  enableUrl?: boolean
  enableAlignment?: boolean
  enableDelay?: boolean
  onChange: (params: ImageEntityWithMeta[], align?: string, delay?: number) => void
  initialSelected?: ImageEntityWithMeta[]
  initialAlign?: string
  initialDelay?: number
}) {
  const {
    enableMultiSelect = false,
    enableCaption = false,
    enableUrl = false,
    enableAlignment = false,
    enableDelay = false,
    onChange,
    initialSelected = [],
    initialAlign,
    initialDelay,
  } = props

  const [queryImages, { loading, error, data: { images = [], imagesCount = 0 } = {} }] = 
    useLazyQuery(imagesQuery, { fetchPolicy: 'no-cache' })

  const [currentPage, setCurrentPage] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<ImageEntityWithMeta[]>(initialSelected)
  const [delay, setDelay] = useState(initialDelay?.toString() ?? '5')
  const [align, setAlign] = useState(initialAlign)
  const [showImageUploader, setShowImageUploader] = useState(false)
  const contentWrapperRef = useRef<HTMLDivElement>(null)

  const pageSize = 18

  // Data Fetching Logic
  useEffect(() => {
    if (currentPage !== 0) {
      queryImages({
        variables: { searchText, skip: (currentPage - 1) * pageSize, take: pageSize },
      })
    }
  }, [currentPage, searchText, queryImages])

  // Selection Handler
  const onImagesGridSelect = (imageEntity: ImageEntity) => {
    setSelected((prev) => {
      const isSelected = prev.find((ele) => ele.image?.id === imageEntity.id)
      
      if (isSelected) {
        return prev.filter((ele) => ele.image?.id !== imageEntity.id)
      }
      
      const newItem = { image: imageEntity, desc: '', url: '' }
      if (enableMultiSelect) {
        return [...prev, newItem]
      }
      return [newItem]
    })
  }

  // 3. Metadata Handler
  const onImageMetaChange = (updatedItem: ImageEntityWithMeta) => {
    setSelected((prev) => 
      prev.map((item) => item.image.id === updatedItem.image.id ? updatedItem : item)
    )
  }

  const onSave = () => {
    const adjustedDelay = Math.max(1, parseFloat(delay) || 1)
    onChange(selected, align, adjustedDelay)
  }

  const onCancel = () => {
    onChange([])
  }

  const onSearchBoxChange: SearchBoxOnChangeFn = (searchInput) => {
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const onImageUploaderChange: ImageUploaderOnChangeFn = (uploadedImages) => {
    const newItems = uploadedImages.map((img) => ({ image: img, desc: '', url: '' }))
    setSelected((prev) => [...prev, ...newItems])
    setShowImageUploader(false)
  }

  let searchResult = (
    <Fragment>
      <ImageGrids 
        images={images} 
        selected={selected.map(s => s.image)} 
        onSelect={onImagesGridSelect} 
      />
      <Pagination
        currentPage={currentPage}
        total={imagesCount}
        pageSize={pageSize}
        onChange={(page) => setCurrentPage(page)}
      />
    </Fragment>
  )

  if (loading) searchResult = <p>searching...</p>
  if (error) {
    searchResult = (
      <ErrorWrapper>
        <h3>Errors in query</h3>
        <div>{error.message}</div>
      </ErrorWrapper>
    )
  }

  return (
    <>
      <GlobalStyle />
      <DrawerController isOpen={true}>
        <Drawer
          title="Select images"
          actions={{
            cancel: { label: 'Cancel', action: onCancel },
            confirm: { label: 'Confirm', action: onSave },
          }}
          width="narrow"
        >
          <div ref={contentWrapperRef}>
            <CustomButton onClick={() => setShowImageUploader(true)}>上傳圖片</CustomButton>
            <ImageSearchBox onChange={onSearchBoxChange} />
            <ImageSelectionWrapper>
              <div>{searchResult}</div>
              {!!selected.length && <SeparationLine />}
              <ImageMetaGridsWrapper>
                {selected.map((item) => (
                  <ImageMetaGrid
                    key={item.image.id}
                    imageMeta={item}
                    enableCaption={enableCaption}
                    enableUrl={enableUrl}
                    onChange={onImageMetaChange}
                  />
                ))}
              </ImageMetaGridsWrapper>
            </ImageSelectionWrapper>
            
            <div style={{ marginTop: '20px' }}>
              {(enableDelay || enableAlignment) && <SeparationLine />}
              {enableDelay && (
                <Fragment>
                  <Label>Slideshow delay:</Label>
                  <TextInput 
                    type="number" 
                    step="0.5" 
                    min="1" 
                    value={delay} 
                    onChange={(e) => setDelay(e.target.value)} 
                  />
                </Fragment>
              )}
              {enableAlignment && (
                <AlignSelector
                  align={align}
                  options={[
                    { value: undefined, label: 'default' },
                    { value: 'left', label: 'left' },
                    { value: 'right', label: 'right' }
                  ] as any}
                  onChange={setAlign}
                  onOpen={() => {
                    const wrapper = contentWrapperRef.current?.parentElement
                    if (wrapper) wrapper.scrollTop = wrapper.scrollHeight
                  }}
                />
              )}
            </div>
          </div>
        </Drawer>
      </DrawerController>
      {showImageUploader && <ImageUploader onChange={onImageUploaderChange} />}
    </>
  )
}
