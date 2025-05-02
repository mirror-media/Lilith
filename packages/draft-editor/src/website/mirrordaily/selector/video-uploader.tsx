import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo'
import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  convertFilesToVideoData,
  convertStringToFile,
} from '../utils/file-convert'
import styled from 'styled-components'
import { Button } from '@keystone-ui/button'
import { VideoEntity } from './video-selector'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import _ from 'lodash'
import { TextInput } from '@keystone-ui/fields'

const videoMutation = gql`
  mutation AddVideo($data: VideoCreateInput!) {
    video: createVideo(data: $data) {
      id
      name
      videoSrc
      youtubeUrl
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

const CustomButton = styled(Button)`
  margin: 10px 0;
`

const HiddenInput = styled.input`
  display: none;
`

const VideoWrapper = styled.div`
  overflow: auto;
  margin-top: 10px;
`

const Video = styled.video`
  width: 100%;
  aspect-ratio: 2;
  object-fit: contain;
`

const VideoName = styled.p`
  text-align: center;
`

const Label = styled.label`
  display: block;
  margin: 10px 0;
  font-weight: 600;
`

const HintWrapper = styled.div`
  margin: 10px 0;
`

export type VideoFileData = {
  uid: string
  name: string
  blobURL: string
  type: string
}

type VideoFileInputProps = {
  onAddVideo: (files: VideoFileData) => void
}

const AddVideo = ({ onAddVideo }: VideoFileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const inputChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    event.target.files = null
    if (!files) return

    const videoFiles = await convertFilesToVideoData(files)
    onAddVideo(videoFiles[0])
  }

  const onUploadButton = () => {
    inputRef.current?.click()
  }

  return (
    <>
      <CustomButton onClick={onUploadButton}>新增影片</CustomButton>
      <HiddenInput
        type="file"
        multiple={false}
        accept="video/*"
        ref={inputRef}
        onChange={inputChangeHandler}
      />
    </>
  )
}

type AddVideoMutationResult = {
  video: VideoEntity
}

type AddVideoMutationVariables = {
  data: {
    name: string
    file: {
      upload: File
    }
  }
}

export type VideoUploaderOnChangeFn = (video?: VideoEntity) => void

export function VideoUploader({
  onChange,
}: {
  onChange: VideoUploaderOnChangeFn
}) {
  const [file, setFile] = useState<VideoFileData>()
  const [
    addVideo,
    { data: uploadData, loading: uploadLoading, error: uploadError },
  ] = useMutation<AddVideoMutationResult, AddVideoMutationVariables>(
    videoMutation
  )

  const onAddVideo = (file: VideoFileData) => {
    setFile(file)
  }

  const onVideoNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!file) return

    setFile({
      ...file,
      name: e.target.value,
    })
  }

  const onConfirm = async () => {
    if (!file) return onChange()
    const data = {
      ...file,
      file: await convertStringToFile(file.blobURL, file.name, file.type),
    }

    addVideo({
      variables: {
        data: {
          name: data.name,
          file: {
            upload: data.file,
          },
        },
      },
    })
  }

  useEffect(() => {
    if (uploadData?.video) {
      onChange(uploadData.video)
    }
  }, [uploadData, onChange])

  return (
    <DrawerController isOpen={true}>
      <Drawer
        title="Upload images"
        actions={{
          cancel: {
            label: 'Cancel',
            action: () => {
              onChange()
            },
          },
          confirm: {
            label: 'Confirm',
            action: onConfirm,
          },
        }}
        width="narrow"
      >
        <div>
          <AddVideo onAddVideo={onAddVideo} />
          {file && (
            <VideoWrapper>
              <Video src={file?.blobURL} muted loop controls autoPlay />
              <Label htmlFor="name">Video Name</Label>
              <TextInput
                id="name"
                type="text"
                defaultValue={file.name}
                onChange={_.debounce(onVideoNameChange)}
              />
              <VideoName>{file.name}</VideoName>
            </VideoWrapper>
          )}
          {uploadLoading && <HintWrapper>loading</HintWrapper>}
          {uploadError && <HintWrapper>{uploadError.message}</HintWrapper>}
        </div>
      </Drawer>
    </DrawerController>
  )
}
