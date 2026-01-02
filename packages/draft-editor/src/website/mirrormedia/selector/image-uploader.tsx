import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { ImageEntity } from './image-selector'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import {
  convertFilesToImageData,
  convertStringToFile,
} from '../utils/file-convert'
import { Button } from '@keystone-ui/button'
import { Checkbox, TextInput } from '@keystone-ui/fields'
import { Select } from '@keystone-ui/fields'
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
  width: 100%;
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

const Label = styled.label`
  display: block;
  margin: 10px 0;
  font-weight: 600;
`

const CustomCheckbox = styled(Checkbox)`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const WatermarkTypeWrapper = styled.div`
  margin-top: 10px;
`

const WatermarkToggleWrapper = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
`

type ImageFileData = {
  uid: string
  name: string
  blobURL: string
  type: string
  shouldSetWatermark: boolean
  watermarkType: string
}

export type RawImageFileData = Pick<
  ImageFileData,
  'uid' | 'name' | 'blobURL' | 'type'
>

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
    console.log('imagesFiles', imagesFiles)
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
      <Label htmlFor="name">Image Name</Label>
      <TextInput
        id="name"
        type="text"
        defaultValue={file.name}
        onChange={_.debounce((e: ChangeEvent<HTMLInputElement>) => {
          onChange({
            ...file,
            name: e.target.value,
          })
        })}
      />
      <ImageName>{file.name}</ImageName>
      <CustomCheckbox
        defaultChecked={file.shouldSetWatermark}
        onChange={_.debounce((e: ChangeEvent<HTMLInputElement>) => {
          onChange({
            ...file,
            shouldSetWatermark: e.target.checked,
          })
        })}
      >
        浮水印
      </CustomCheckbox>
      {file.shouldSetWatermark && (
        <WatermarkTypeWrapper>
          <Select
            value={{
              label: file.watermarkType === 'mirrordaily' ? '鏡報' : '鏡週刊',
              value: file.watermarkType,
            }}
            onChange={(option: any) => {
              onChange({
                ...file,
                watermarkType: option?.value || 'mirrormedia',
              })
            }}
            options={[
              { label: '鏡週刊', value: 'mirrormedia' },
              { label: '鏡報', value: 'mirrordaily' },
            ]}
          />
        </WatermarkTypeWrapper>
      )}
    </ImageFileWrapper>
  )
}

type AddPhotosMutationResult = {
  photos: ImageEntity[]
}

type AddPhotosMutationVariables = {
  data: {
    name: string
    imageFile: {
      upload: File
    }
    waterMark: boolean
    watermarkType: string
  }[]
}

export type ImageUploaderOnChangeFn = (images: ImageEntity[]) => void

export function ImageUploader({
  onChange,
}: {
  onChange: (images: ImageEntity[]) => void
}) {
  const [files, setFiles] = useState<ImageFileData[]>([])
  const [watermarkAll, setWatermarkAll] = useState(true)
  const [watermarkTypeAll, setWatermarkTypeAll] = useState('mirrormedia')
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
        shouldSetWatermark: watermarkAll,
        watermarkType: watermarkTypeAll,
      }))

    setFiles((prev) => prev.concat(newFiles))
  }

  const toggleAllWatermarks = (checked: boolean) => {
    setWatermarkAll(checked)
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        shouldSetWatermark: checked,
      }))
    )
  }

  const changeAllWatermarkTypes = (type: string) => {
    setWatermarkTypeAll(type)
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        watermarkType: type,
      }))
    )
  }

  const onConfirm = async () => {
    if (!files.length) return onChange([])

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
          watermarkType: d.watermarkType,
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
          {files.length > 0 && (
            <WatermarkToggleWrapper>
              <CustomCheckbox
                checked={watermarkAll}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  toggleAllWatermarks(e.target.checked)
                }}
              >
                全部加上浮水印
              </CustomCheckbox>
              {watermarkAll && (
                <WatermarkTypeWrapper>
                  <Select
                    value={{
                      label:
                        watermarkTypeAll === 'mirrordaily' ? '鏡報' : '鏡週刊',
                      value: watermarkTypeAll,
                    }}
                    onChange={(option: any) => {
                      const type = option?.value || 'mirrormedia'
                      changeAllWatermarkTypes(type)
                    }}
                    options={[
                      { label: '鏡週刊', value: 'mirrormedia' },
                      { label: '鏡報', value: 'mirrordaily' },
                    ]}
                  />
                </WatermarkTypeWrapper>
              )}
            </WatermarkToggleWrapper>
          )}
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
