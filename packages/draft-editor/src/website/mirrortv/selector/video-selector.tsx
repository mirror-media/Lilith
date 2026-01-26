import React, { Fragment, useEffect, useState } from 'react'
import debounce from 'lodash/debounce'
import styled from 'styled-components'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo'
import { ImageEntity } from './image-selector'
import { SearchBox, SearchBoxOnChangeFn } from './search-box'
import { Pagination } from './pagination'
import { TextInput } from '@keystone-ui/fields'

const videosQuery = gql`
  query Videos($searchText: String!, $take: Int, $skip: Int) {
    videosCount(where: { name: { contains: $searchText } })
    videos(
      where: { name: { contains: $searchText } }
      orderBy: { id: desc }
      take: $take
      skip: $skip
    ) {
      id
      name
      videoSrc
      file {
        filename
        filesize
        url
      }
      coverPhoto {
        id
        name
        resized {
          original
        }
      }
    }
  }
`

const _ = {
  debounce,
}

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
  aspect-ratio: 16 / 9;
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

const Label = styled.label`
  display: block;
  margin: 10px 0;
  font-weight: 600;
`

type ID = string

export type VideoEntity = {
  id: ID
  name?: string
  videoSrc: string
  youtubeUrl?: string
  file: {
    filename?: string
    filesize: number
    url: string
  }
  coverPhoto?: {
    id: string
    name: string
    resized: {
      original: string
    }
  }
}

export type VideoEntityWithMeta = {
  video: VideoEntity
  desc: string
}

type VideoEntityOnSelectFn = (param: VideoEntity) => void

const getYoutubeId = (url: string | undefined): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

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
            isSelected={selected?.some((s) => s.id === video.id)}
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
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setIsPlaying(false)
  }, [video.id])

  const youtubeId = getYoutubeId(video?.videoSrc)
  const fileUrl = video?.file?.url
  const posterUrl = video?.coverPhoto?.resized?.original || 
    (youtubeId ? `https://img.youtube.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg` : "");

  const handlePlayAndSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      onSelect(video)
    }
  }

  return (
    <VideoGridWrapper key={video?.id} onClick={() => onSelect(video)}>
      <VideoSelected style={{ height: '24px', marginBottom: '4px' }}>
        {isSelected ? <i className="fas fa-check-circle" style={{ color: '#007bff' }}></i> : null}
      </VideoSelected>
      
      <div 
        onClick={handlePlayAndSelect}
        style={{ 
          width: '100%', 
          aspectRatio: '16/9',
          position: 'relative', 
          backgroundColor: '#000',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {isPlaying ? (
          youtubeId ? (
            <iframe
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <Video autoPlay controls muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
              {(fileUrl || video?.videoSrc) && <source src={fileUrl || video?.videoSrc} />}
            </Video>
          )
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i 
              className={youtubeId ? "fab fa-youtube" : "fas fa-play-circle"} 
              style={{ color: 'white', fontSize: '2.5rem', opacity: 0.8 }} 
            />
          </div>
        )}
      </div>

      <VideoName
        style={{ 
          marginTop: '8px',
          fontSize: '14px',
          height: '1.2em',
          lineHeight: '1.2',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: isSelected ? '#007bff' : 'inherit'
        }}
      >
        {video?.name || "Untitled"}
      </VideoName>
    </VideoGridWrapper>
  )
}

type VideoMetaOnChangeFn = (params: VideoEntityWithMeta) => void

function VideoMetaGrids(props: {
  videoMetas: VideoEntityWithMeta[]
  onChange: VideoMetaOnChangeFn
}) {
  const { videoMetas, onChange } = props
  return (
    <VideoMetaGridsWrapper>
      {videoMetas.map((videoMeta) => (
        <VideoMetaGrid
          key={videoMeta?.video?.id}
          videoMeta={videoMeta}
          onChange={onChange}
        />
      ))}
    </VideoMetaGridsWrapper>
  )
}

function VideoMetaGrid(props: {
  videoMeta: VideoEntityWithMeta
  onChange: VideoMetaOnChangeFn
}): React.ReactElement {
  const { videoMeta, onChange } = props
  const { video, desc } = videoMeta

  const youtubeId = getYoutubeId(video?.videoSrc)
  const posterUrl = video?.coverPhoto?.resized?.original || 
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "");

  const onVideoDescriptionChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    onChange({
      video,
      desc: e.target.value,
    })
  }

  return (
    <VideoMetaGridWrapper>
      {youtubeId ? (
        <iframe
          width="100%"
          style={{ aspectRatio: '16/9', border: 'none', backgroundColor: '#000' }}
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&autoplay=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <Video muted autoPlay loop controls poster={posterUrl} style={{ width: '100%', aspectRatio: '16/9' }}>
          {(video?.videoSrc || video?.file?.url) && (
            <source src={video?.videoSrc || video?.file?.url} />
          )}
        </Video>
      )}

      <Label>Video Name</Label>
      <VideoName style={{ textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>
        {video?.name || 'Untitled'}
      </VideoName>
      
      <Label htmlFor="description">Video Description</Label>
      <TextInput
        id="description"
        type="text"
        placeholder="(Optional)"
        defaultValue={desc}
        onChange={_.debounce(onVideoDescriptionChange, 300)}
      />
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

  const onVideoMetaChange: VideoMetaOnChangeFn = (videoEntityWithMeta) => {
    setSelected([videoEntityWithMeta])
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
      return [{ video: videoEntity, desc: '' }]
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
          <pre>{videosQuery.loc?.source.body}</pre>
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
            <VideoMetaGrids
              videoMetas={selected}
              onChange={onVideoMetaChange}
            />
          </VideoSelectionWrapper>
        </div>
      </Drawer>
    </DrawerController>
  )
}
