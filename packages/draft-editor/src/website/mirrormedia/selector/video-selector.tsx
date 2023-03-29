import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo'
import { ImageEntity } from './image-selector'
import { SearchBox, SearchBoxOnChangeFn } from './search-box'
import { Pagination } from './pagination'

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
      urlOriginal
      file {
        filename
        filesize
        url
      }
      heroImage {
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

const VideoName = styled.p`
  text-align: center;
`

type ID = string

export type VideoEntity = {
  id: ID
  name?: string
  urlOriginal: string
  youtubeUrl?: string
  file: {
    filename?: string
    filesize: number
    url: string
  }
  heroImage: ImageEntity
}

export type VideoEntityWithMeta = {
  video: VideoEntity
}

type VideoEntityOnSelectFn = (param: VideoEntity) => void

function VideosGrids(props: {
  videos: VideoEntity[]
  selected: VideoEntity[]
  onSelect: VideoEntityOnSelectFn
}): React.ReactElement {
  const { videos, selected, onSelect } = props

  return (
    <VideoGridsWrapper>
      {videos.map((video) => {
        return (
          <VideoGrid
            key={video.id}
            isSelected={selected?.includes(video)}
            onSelect={() => onSelect(video)}
            video={video}
          />
        )
      })}
    </VideoGridsWrapper>
  )
}

function VideoGrid(props: {
  video: VideoEntity
  isSelected: boolean
  onSelect: VideoEntityOnSelectFn
}) {
  const { video, onSelect, isSelected } = props
  return (
    <VideoGridWrapper key={video?.id} onClick={() => onSelect(video)}>
      <VideoSelected>
        {isSelected ? <i className="fas fa-check-circle"></i> : null}
      </VideoSelected>
      <Video muted loop>
        <source src={video?.urlOriginal} />
        <source src={video?.file?.url} />
      </Video>
    </VideoGridWrapper>
  )
}

function VideoMetaGrids(props: { videoMetas: VideoEntityWithMeta[] }) {
  const { videoMetas } = props
  return (
    <VideoMetaGridsWrapper>
      {videoMetas.map((videoMeta) => (
        <VideoMetaGrid key={videoMeta?.video?.id} videoMeta={videoMeta} />
      ))}
    </VideoMetaGridsWrapper>
  )
}

function VideoMetaGrid(props: {
  videoMeta: VideoEntityWithMeta
}): React.ReactElement {
  const { videoMeta } = props
  const { video } = videoMeta

  return (
    <VideoMetaGridWrapper>
      <Video muted autoPlay loop>
        <source src={video?.urlOriginal} />
        <source src={video?.file?.url} />
      </Video>
      <VideoName>{video?.name}</VideoName>
    </VideoMetaGridWrapper>
  )
}

type VideoSelectorOnChangeFn = (params: VideoEntityWithMeta[]) => void

export function VideoSelector(props: { onChange: VideoSelectorOnChangeFn }) {
  const [
    queryVideos,
    { loading, error, data: { videos = [], videosCount = 0 } = {} },
  ] = useLazyQuery(videosQuery, { fetchPolicy: 'no-cache' })
  const [currentPage, setCurrentPage] = useState(0) // page starts with 1, 0 is used to detect initialization
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<VideoEntityWithMeta[]>([])

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

  const onVideosGridSelect: VideoEntityOnSelectFn = (videoEntity) => {
    setSelected((selected) => {
      const filterdSelected = selected.filter(
        (ele) => ele.video?.id !== videoEntity.id
      )

      // deselect the video
      if (filterdSelected.length !== selected.length) {
        return filterdSelected
      }

      // single select
      return [{ video: videoEntity }]
    })
  }

  const selectedVideos = selected.map((ele: VideoEntityWithMeta) => {
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
    <React.Fragment>
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
    </React.Fragment>
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
          <pre>{videosQuery.loc.source.body}</pre>
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
