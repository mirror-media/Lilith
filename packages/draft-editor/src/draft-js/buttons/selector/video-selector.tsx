import React, { Fragment, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo'
import { ImageEntity } from './image-selector'
import { SearchBox, SearchBoxOnChangeFn } from './search-box'
import { Pagination } from './pagination'

const VideoSearchBox = styled(SearchBox)`
  margin-top: 10px;
`

const VideoSelectionWrapper = styled.div`
  overflow: auto;
  margin-top: 10px;
`

const VideoGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const VideoGridWrapper = styled.div`
  flex: 0 0 33.3333%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const VideoMetaGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const VideoMetaGridWrapper = styled.div`
  flex: 0 0 33.3333%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const Video = styled.video`
  display: block;
  width: 100%;
  aspect-ratio: 2;
  object-fit: cover;
`

const SeparationLine = styled.div`
  border: #e1e5e9 1px solid;
  margin-top: 10px;
  margin-bottom: 10px;
`

const VideoSelected = styled.div`
  height: 1.4rem;
`

const ErrorWrapper = styled.div`
  & * {
    margin: 0;
  }
`

type ID = string

export type VideoEntity = {
  id: ID
  name?: string
  videoSrc: string
  youtubeUrl?: string
  description?: string
  videoFile: {
    filename?: string
    filesize: number
    url: string
  }
  coverPhoto: ImageEntity
}

export type VideoEntityWithMeta<T> = {
  video: T
  desc?: string
}

type VideoEntityOnSelectFn<T> = (param: T) => void

function VideosGrids<T>(props: {
  videos: T[]
  selected: T[]
  onSelect: VideoEntityOnSelectFn<T>
}): React.ReactElement {
  const { videos, selected, onSelect } = props

  return (
    <VideoGridsWrapper>
      {videos.map((video) => {
        return (
          <VideoGrid
            key={(video as VideoEntity).id}
            isSelected={selected?.includes(video)}
            onSelect={() => onSelect(video)}
            video={video}
          />
        )
      })}
    </VideoGridsWrapper>
  )
}

function VideoGrid<T>(props: {
  video: T
  isSelected: boolean
  onSelect: VideoEntityOnSelectFn<T>
}) {
  const { video, onSelect, isSelected } = props

  const newVideo = video as VideoEntity

  return (
    <VideoGridWrapper key={newVideo?.id} onClick={() => onSelect(video)}>
      <VideoSelected>
        {isSelected ? <i className="fas fa-check-circle"></i> : null}
      </VideoSelected>
      <Video muted loop>
        <source src={newVideo?.videoSrc} />
        <source src={newVideo?.videoFile?.url} />
      </Video>
    </VideoGridWrapper>
  )
}

function VideoMetaGrids<T>(props: { videoMetas: VideoEntityWithMeta<T>[] }) {
  const { videoMetas } = props
  return (
    <VideoMetaGridsWrapper>
      {videoMetas.map((videoMeta) => (
        <VideoMetaGrid
          key={(videoMeta?.video as VideoEntity)?.id}
          videoMeta={videoMeta}
        />
      ))}
    </VideoMetaGridsWrapper>
  )
}

function VideoMetaGrid<T>(props: {
  videoMeta: VideoEntityWithMeta<T>
}): React.ReactElement {
  const { videoMeta } = props
  const { video } = videoMeta

  const newVideo = video as VideoEntity

  return (
    <VideoMetaGridWrapper>
      <Video muted autoPlay loop>
        <source src={newVideo?.videoSrc} />
        <source src={newVideo?.videoFile?.url} />
      </Video>
    </VideoMetaGridWrapper>
  )
}

const videosQuery = gql`
  query Videos($searchText: String!, $take: Int, $skip: Int) {
    videosCount(where: { name: { contains: $searchText } })
    videos(
      where: { name: { contains: $searchText } }
      take: $take
      skip: $skip
    ) {
      id
      name
      videoSrc
      description
      videoFile {
        filename
        filesize
        url
      }
      coverPhoto {
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
  }
`

type VideoSelectorOnChangeFn<T> = (params: VideoEntityWithMeta<T>[]) => void

export function VideoSelector<T>(props: {
  onChange: VideoSelectorOnChangeFn<T>
}) {
  const [
    queryVideos,
    { loading, error, data: { videos = [], videosCount = 0 } = {} },
  ] = useLazyQuery(videosQuery, { fetchPolicy: 'no-cache' })
  const [currentPage, setCurrentPage] = useState(0) // page starts with 1, 0 is used to detect initialization
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<VideoEntityWithMeta<T>[]>([])

  const pageSize = 6

  const { onChange } = props

  const onSave = () => {
    onChange(selected)
  }

  const onCancel = () => {
    onChange([])
  }

  const onSearchBoxChange: SearchBoxOnChangeFn = async (searchInput) => {
    setSearchText(searchInput)
    setCurrentPage(1)
  }

  const onVideosGridSelect: VideoEntityOnSelectFn<T> = (videoEntity) => {
    setSelected((selected) => {
      const filterdSelected = selected.filter(
        (ele) =>
          (ele.video as VideoEntity)?.id !== (videoEntity as VideoEntity).id
      )

      // deselect the video
      if (filterdSelected.length !== selected.length) {
        return filterdSelected
      }

      // single select
      return [{ video: videoEntity }]
    })
  }

  const selectedVideos = selected.map((ele: VideoEntityWithMeta<T>) => {
    return ele.video
  })

  useEffect(() => {
    if (currentPage !== 0) {
      queryVideos({
        variables: {
          searchText: searchText,
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
        },
      })
    }
  }, [currentPage, searchText])

  let searchResult = (
    <Fragment>
      <VideosGrids
        videos={videos}
        selected={selectedVideos}
        onSelect={onVideosGridSelect}
      />
      <Pagination
        currentPage={currentPage}
        total={videosCount}
        pageSize={pageSize}
        onChange={(pageIndex) => {
          setCurrentPage(pageIndex)
        }}
      />
    </Fragment>
  )
  if (loading) {
    searchResult = <p>searching...</p>
  }
  if (error) {
    searchResult = (
      <ErrorWrapper>
        <h3>Errors occurs in the `videos` query</h3>
        <div>
          <br />
          <b>Message:</b>
          <div>{error.message}</div>
          <br />
          <b>Stack:</b>
          <div>{error.stack}</div>
          <br />
          <b>Query:</b>
          <pre>{videosQuery?.loc?.source.body}</pre>
        </div>
      </ErrorWrapper>
    )
  }

  return (
    <DrawerController isOpen={true}>
      <Drawer
        title="Select video"
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
        <div>
          <VideoSearchBox onChange={onSearchBoxChange} />
          <VideoSelectionWrapper>
            <div>{searchResult}</div>
            {!!selected.length && <SeparationLine />}
            <VideoMetaGrids videoMetas={selected} />
          </VideoSelectionWrapper>
        </div>
      </Drawer>
    </DrawerController>
  )
}
