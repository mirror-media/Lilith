import React, { useState, useEffect, useRef } from 'react'
import debounce from 'lodash/debounce'
import styled from 'styled-components'
import { TextInput } from '@keystone-ui/fields'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo'
import { AlignSelector } from './align-selector'
import { SearchBox, SearchBoxOnChangeFn } from './search-box'
import { Pagination } from './pagination'

const imagesQuery = gql`
  query Photos($searchText: String!, $take: Int, $skip: Int) {
    photosCount(where: { name: { contains: $searchText } })
    photos(
      where: { name: { contains: $searchText } }
      take: $take
      skip: $skip
    ) {
      id
      name
      imageFile {
        url
      }
      resized {
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

const ImageSearchBox = styled(SearchBox)`
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
  flex: 0 0 33.3333%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const ImageMetaGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const ImageMetaGridWrapper = styled.div`
  flex: 0 0 33.3333%;
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

export type ImageEntity = {
  id: ID
  name?: string
  imageFile: {
    url: string
  }
  resized: {
    original: string
    w480: string
    w800: string
    w1200: string
    w1600: string
    w2400: string
  }
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
            isSelected={selected?.includes(image)}
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
  return (
    <ImageGridWrapper key={image?.id} onClick={() => onSelect(image)}>
      <ImageSelected>
        {isSelected ? <i className="fas fa-check-circle"></i> : null}
      </ImageSelected>
      <Image
        src={image?.resized?.w800}
        onError={(e) => (e.currentTarget.src = image?.imageFile?.url)}
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
  onChange: ImageMetaOnChangeFn
  enableCaption: boolean
  enableUrl: boolean
}): React.ReactElement {
  const { imageMeta, enableCaption, enableUrl, onChange } = props
  const { image, desc, url } = imageMeta

  return (
    <ImageMetaGridWrapper>
      <Image
        src={image?.resized?.w800}
        onError={(e) => (e.currentTarget.src = image?.imageFile?.url)}
      />
      <ImageName>{image?.name}</ImageName>
      {enableCaption && (
        <React.Fragment>
          <Label htmlFor="caption">Image Caption:</Label>
          <TextInput
            id="caption"
            type="text"
            placeholder={image?.name}
            defaultValue={desc}
            onChange={_.debounce((e) => {
              onChange({
                image,
                desc: e.target.value,
                url,
              })
            })}
          />
        </React.Fragment>
      )}
      {enableUrl && (
        <React.Fragment>
          <Label htmlFor="url">Url:</Label>
          <TextInput
            id="url"
            type="text"
            placeholder="(Optional)"
            defaultValue={url}
            onChange={_.debounce((e) => {
              onChange({
                image,
                desc,
                url: e.target.value,
              })
            })}
          />
        </React.Fragment>
      )}
    </ImageMetaGridWrapper>
  )
}

type DelayInputOnChangeFn = (param: string) => void

function DelayInput(props: {
  delay: string
  onChange: DelayInputOnChangeFn
}): React.ReactElement {
  const { delay, onChange } = props

  return (
    <React.Fragment>
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
    </React.Fragment>
  )
}

type ImageSelectorOnChangeFn = (
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
  onChange: ImageSelectorOnChangeFn
}) {
  const [
    queryImages,
    {
      loading,
      error,
      data: { photos: images = [], photosCount: imagesCount = 0 } = {},
    },
  ] = useLazyQuery(imagesQuery, { fetchPolicy: 'no-cache' })
  const [currentPage, setCurrentPage] = useState(0) // page starts with 1, 0 is used to detect initialization
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<ImageEntityWithMeta[]>([])
  const [delay, setDelay] = useState('5')
  const [align, setAlign] = useState(undefined)
  const contentWrapperRef = useRef<HTMLDivElement>()

  const pageSize = 6

  const options = [
    { value: undefined, label: 'default', isDisabled: false },
    { value: 'left', label: 'left', isDisabled: false },
    { value: 'right', label: 'right', isDisabled: false },
  ]

  const {
    enableMultiSelect = false,
    enableCaption = false,
    enableUrl = false,
    enableAlignment = false,
    enableDelay = false,
    onChange,
  } = props

  const onSave = () => {
    let adjustedDelay = +delay
    adjustedDelay = adjustedDelay < 1 ? 1 : adjustedDelay
    onChange(selected, align, adjustedDelay)
  }

  const onCancel = () => {
    onChange([])
  }

  const onSearchBoxChange: SearchBoxOnChangeFn = async (searchInput) => {
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const onDealyChange = (delay: string) => {
    setDelay(delay)
  }

  const onAlignSelectChange = (align: string) => {
    setAlign(align)
  }

  const onAlignSelectOpen = () => {
    const scrollWrapper = contentWrapperRef.current?.parentElement
    scrollWrapper.scrollTop = scrollWrapper.scrollHeight
  }

  const onImageMetaChange: ImageMetaOnChangeFn = (imageEntityWithMeta) => {
    if (enableMultiSelect) {
      const foundIndex = selected.findIndex(
        (ele) => ele?.image?.id === imageEntityWithMeta?.image?.id
      )
      if (foundIndex !== -1) {
        selected[foundIndex] = imageEntityWithMeta
        setSelected(selected)
      }
      return
    }
    setSelected([imageEntityWithMeta])
  }

  const onImagesGridSelect: ImageEntityOnSelectFn = (imageEntity) => {
    setSelected((selected) => {
      const filterdSelected = selected.filter(
        (ele) => ele.image?.id !== imageEntity.id
      )

      // deselect the image
      if (filterdSelected.length !== selected.length) {
        return filterdSelected
      }

      // add new selected one
      if (enableMultiSelect) {
        return selected.concat([{ image: imageEntity, desc: '' }])
      }

      // single select
      return [{ image: imageEntity, desc: '' }]
    })
  }

  const selectedImages = selected.map((ele: ImageEntityWithMeta) => {
    return ele.image
  })

  useEffect(() => {
    if (currentPage !== 0) {
      queryImages({
        variables: {
          searchText: searchText,
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
        },
      })
    }
  }, [currentPage, searchText])

  let searchResult = (
    <React.Fragment>
      <ImageGrids
        images={images}
        selected={selectedImages}
        onSelect={onImagesGridSelect}
      />
      <Pagination
        currentPage={currentPage}
        total={imagesCount}
        pageSize={pageSize}
        onChange={(pageIndex) => {
          setCurrentPage(pageIndex)
        }}
      />
    </React.Fragment>
  )
  if (loading) {
    searchResult = <p>searching...</p>
  }
  if (error) {
    searchResult = (
      <ErrorWrapper>
        <h3>Errors occurs in the `images` query</h3>
        <div>
          <br />
          <b>Message:</b>
          <div>{error.message}</div>
          <br />
          <b>Stack:</b>
          <div>{error.stack}</div>
          <br />
          <b>Query:</b>
          <pre>{imagesQuery.loc.source.body}</pre>
        </div>
      </ErrorWrapper>
    )
  }

  return (
    <DrawerController isOpen={true}>
      <Drawer
        title="Select image"
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
        <div ref={contentWrapperRef}>
          <ImageSearchBox onChange={onSearchBoxChange} />
          <ImageSelectionWrapper>
            <div>{searchResult}</div>
            {!!selected.length && <SeparationLine />}
            <ImageMetaGrids
              imageMetas={selected}
              onChange={onImageMetaChange}
              enableCaption={enableCaption}
              enableUrl={enableUrl}
            />
          </ImageSelectionWrapper>
          <ImageBlockMetaWrapper>
            {(enableDelay || enableAlignment) && <SeparationLine />}
            {enableDelay && (
              <DelayInput delay={delay} onChange={onDealyChange} />
            )}
            {enableAlignment && (
              <AlignSelector
                align={align}
                options={options}
                onChange={onAlignSelectChange}
                onOpen={onAlignSelectOpen}
              />
            )}
          </ImageBlockMetaWrapper>
        </div>
      </Drawer>
    </DrawerController>
  )
}
