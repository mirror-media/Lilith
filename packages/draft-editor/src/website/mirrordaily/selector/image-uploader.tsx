import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { ImageEntity } from './image-selector'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { convertFilesToImageData, convertStringToFile } from '../utils/image'
import { Button } from '@keystone-ui/button'
import { Checkbox } from '@keystone-ui/fields'
import _ from 'lodash'

const imagesMutation = gql`
  mutation AddPhotos($data: [PhotoCreateInput!]!) {
    photos: createPhotos(data: $data) {
      id
      name
      imageFile {
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

type ImageFileData = {
  uid: string
  originalName: string
  name: string
  blobURL: string
  type: string
  isSelected: boolean
  shouldSetWatermark: boolean
}

export type RawImageFileData = Pick<
  ImageFileData,
  'uid' | 'name' | 'blobURL' | 'type'
>

const CustomButton = styled(Button)`
  margin-top: 10px;
`

const HiddenInput = styled.input`
  display: none;
`

const ImagesWrapper = styled.div`
  overflow: auto;
  margin-top: 10px;
`

const ImageFilesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
`

const ImageFileWrapper = styled.div`
  flex: 0 0 33.3333%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const Image = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 2;
  object-fit: contain;
`

const ImageName = styled.p`
  text-align: center;
`

const CustomCheckbox = styled(Checkbox)`
  display: flex;
  align-items: center;
  cursor: pointer;
`

type ImageFileInputProps = {
  onAddImages: (files: RawImageFileData[]) => void
}

const AddImages = ({ onAddImages }: ImageFileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const inputChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    event.target.files = null
    if (!files) return

    const imagesFiles = await convertFilesToImageData(files)
    onAddImages(imagesFiles)
  }

  const onUploadButton = () => {
    inputRef.current?.click()
  }

  return (
    <>
      <CustomButton onClick={onUploadButton}>新增圖片</CustomButton>
      <HiddenInput
        type="file"
        multiple={true}
        accept="image/*"
        ref={inputRef}
        onChange={inputChangeHandler}
      />
    </>
  )
}

type ImageFileOnChangeFn = (file: ImageFileData) => void

const ImageFiles = ({
  files,
  onChange,
}: {
  files: ImageFileData[]
  onChange: ImageFileOnChangeFn
}) => {
  return (
    <ImageFilesWrapper>
      {files.map((file) => (
        <ImageFile key={file.uid} file={file} onChange={onChange} />
      ))}
    </ImageFilesWrapper>
  )
}

const ImageFile = ({
  file,
  onChange,
}: {
  file: ImageFileData
  onChange: ImageFileOnChangeFn
}) => {
  return (
    <ImageFileWrapper>
      <Image src={file.blobURL} />
      <ImageName>{file.name}</ImageName>
      <CustomCheckbox
        defaultChecked={file.shouldSetWatermark}
        onChange={_.debounce((e: ChangeEvent<HTMLInputElement>) => {
          console.log(e.target.checked)
          onChange({
            ...file,
            shouldSetWatermark: e.target.checked,
          })
        })}
      >
        浮水印
      </CustomCheckbox>
    </ImageFileWrapper>
  )
}

type AddPhotosMutationResult = {
  photos: ImageEntity[] // 或者你要手動定義一個正確的型別
}

type AddPhotosMutationVariables = {
  data: {
    name: string
    imageFile: {
      upload: File
    }
    waterMark: boolean
  }[]
}

export type ImageUploaderOnChangeFn = (images: ImageEntity[]) => void

export function ImageUploader({
  onChange,
}: {
  onChange: (images: ImageEntity[]) => void
}) {
  const [files, setFiles] = useState<ImageFileData[]>([])
  const [
    addPhotos,
    { data: uploadData, loading: uploadLoading, error: uploadError },
  ] = useMutation<AddPhotosMutationResult, AddPhotosMutationVariables>(
    imagesMutation
  )

  const onAddImages = (rawFiles: RawImageFileData[]) => {
    const existedImageUids = new Set(files.map((file) => file.uid))
    const newFiles: ImageFileData[] = rawFiles
      .filter((file) => !existedImageUids.has(file.uid))
      .map((rawFile) => ({
        ...rawFile,
        originalName: rawFile.name,
        isSelected: false,
        shouldSetWatermark: true,
      }))

    setFiles((prev) => prev.concat(newFiles))
  }

  const onConfirm = async () => {
    const tasks = files.map(async (data) => ({
      ...data,
      file: await convertStringToFile(data.blobURL, data.name, data.type),
    }))

    const data = (await Promise.allSettled(tasks))
      .filter(function <T>(
        settledResult: PromiseSettledResult<T>
      ): settledResult is PromiseFulfilledResult<T> {
        return settledResult.status === 'fulfilled'
      })
      .map((result) => result.value)

    addPhotos({
      variables: {
        data: data.map((d) => ({
          name: d.name,
          imageFile: {
            upload: d.file,
          },
          waterMark: d.shouldSetWatermark,
        })),
      },
    })
  }

  const onImageFileChang: ImageFileOnChangeFn = (file) => {
    const newFiles = Array.from(files)
    const foundIndex = newFiles.findIndex((ele) => ele.uid === file.uid)
    if (foundIndex !== -1) {
      newFiles[foundIndex] = file
      setFiles(newFiles)
    }
  }

  useEffect(() => {
    if (uploadData?.photos?.length) {
      onChange(uploadData.photos)
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
              onChange([])
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
          <AddImages onAddImages={onAddImages} />
          <ImagesWrapper>
            <ImageFiles files={files} onChange={onImageFileChang}></ImageFiles>
          </ImagesWrapper>
          {uploadLoading && <div>loading</div>}
          {uploadError && <div>{uploadError.message}</div>}
        </div>
      </Drawer>
    </DrawerController>
  )
}
