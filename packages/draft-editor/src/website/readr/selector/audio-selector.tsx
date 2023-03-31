import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo'
import { SearchBox, SearchBoxOnChangeFn } from './search-box'
import { Pagination } from './pagination'

const AudioSearchBox = styled(SearchBox)`
  margin-top: 10px;
`

const AudioSelectionWrapper = styled.div`
  overflow: auto;
  margin-top: 10px;
`

const AudioGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const AudioGridWrapper = styled.div`
  flex: 0 0 50%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const AudioMetaGridsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const AudioMetaGridWrapper = styled.div`
  flex: 0 0 50%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const Audio = styled.audio`
  width: 100%;
`

const AudioName = styled.p`
  text-align: center;
`

const SeparationLine = styled.div`
  border: #e1e5e9 1px solid;
  margin-top: 10px;
  margin-bottom: 10px;
`

const AudioSelected = styled.div`
  height: 1.4rem;
`

const ErrorWrapper = styled.div`
  & * {
    margin: 0;
  }
`

type ID = string

export type AudioEntity = {
  id: ID
  name?: string
  url?: string
  file?: {
    url: string
  }
}

export type AudioEntityWithMeta = {
  audio: AudioEntity
}

type AudioEntityOnSelectFn = (param: AudioEntity) => void

function AudiosGrids(props: {
  audios: AudioEntity[]
  selected: AudioEntity[]
  onSelect: AudioEntityOnSelectFn
}): React.ReactElement {
  const { audios, selected, onSelect } = props

  return (
    <AudioGridsWrapper>
      {audios.map((audio) => {
        return (
          <AudioGrid
            key={audio.id}
            isSelected={selected?.includes(audio)}
            onSelect={() => onSelect(audio)}
            audio={audio}
          />
        )
      })}
    </AudioGridsWrapper>
  )
}

function AudioGrid(props: {
  audio: AudioEntity
  isSelected: boolean
  onSelect: AudioEntityOnSelectFn
}) {
  const { audio, onSelect, isSelected } = props
  return (
    <AudioGridWrapper key={audio?.id} onClick={() => onSelect(audio)}>
      <AudioSelected>
        {isSelected ? <i className="fas fa-check-circle"></i> : null}
      </AudioSelected>
      <Audio controls>
        <source src={audio?.url} />
        <source src={audio?.file?.url} />
      </Audio>
      <AudioName>{audio?.name}</AudioName>
    </AudioGridWrapper>
  )
}

function AudioMetaGrids(props: { audioMetas: AudioEntityWithMeta[] }) {
  const { audioMetas } = props
  return (
    <AudioMetaGridsWrapper>
      {audioMetas.map((audioMeta) => (
        <AudioMetaGrid key={audioMeta?.audio?.id} audioMeta={audioMeta} />
      ))}
    </AudioMetaGridsWrapper>
  )
}

function AudioMetaGrid(props: {
  audioMeta: AudioEntityWithMeta
}): React.ReactElement {
  const { audioMeta } = props
  const { audio } = audioMeta

  return (
    <AudioMetaGridWrapper>
      <Audio controls>
        <source src={audio?.url} />
        <source src={audio?.file?.url} />
      </Audio>
      <AudioName>{audio?.name}</AudioName>
    </AudioMetaGridWrapper>
  )
}

const AudiosQuery = gql`
  query Audios($searchText: String!, $take: Int, $skip: Int) {
    audioFilesCount(where: { name: { contains: $searchText } })
    audioFiles(
      where: { name: { contains: $searchText } }
      take: $take
      skip: $skip
    ) {
      id
      name
      url
      file {
        url
      }
    }
  }
`

type AudioSelectorOnChangeFn = (params: AudioEntityWithMeta[]) => void

export function AudioSelector(props: { onChange: AudioSelectorOnChangeFn }) {
  const [
    queryAudios,
    { loading, error, data: { audioFiles = [], audioFilesCount = 0 } = {} },
  ] = useLazyQuery(AudiosQuery, { fetchPolicy: 'no-cache' })
  const [currentPage, setCurrentPage] = useState(0) // page starts with 1, 0 is used to detect initialization
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<AudioEntityWithMeta[]>([])

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

  const onAudiosGridSelect: AudioEntityOnSelectFn = (audioEntity) => {
    setSelected((selected) => {
      const filterdSelected = selected.filter(
        (ele) => ele.audio?.id !== audioEntity.id
      )

      // deselect the audio
      if (filterdSelected.length !== selected.length) {
        return filterdSelected
      }

      // single select
      return [{ audio: audioEntity }]
    })
  }

  const selectedAudios = selected.map((ele: AudioEntityWithMeta) => {
    return ele.audio
  })

  useEffect(() => {
    if (currentPage !== 0) {
      queryAudios({
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
      <AudiosGrids
        audios={audioFiles}
        selected={selectedAudios}
        onSelect={onAudiosGridSelect}
      />
      <Pagination
        currentPage={currentPage}
        total={audioFilesCount}
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
        <h3>Errors occurs in the `audios` query</h3>
        <div>
          <br />
          <b>Message:</b>
          <div>{error.message}</div>
          <br />
          <b>Stack:</b>
          <div>{error.stack}</div>
          <br />
          <b>Query:</b>
          <pre>{AudiosQuery.loc.source.body}</pre>
        </div>
      </ErrorWrapper>
    )
  }

  return (
    <DrawerController isOpen={true}>
      <Drawer
        title="Select audio"
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
          <AudioSearchBox onChange={onSearchBoxChange} />
          <AudioSelectionWrapper>
            <div>{searchResult}</div>
            {!!selected.length && <SeparationLine />}
            <AudioMetaGrids audioMetas={selected} />
          </AudioSelectionWrapper>
        </div>
      </Drawer>
    </DrawerController>
  )
}
