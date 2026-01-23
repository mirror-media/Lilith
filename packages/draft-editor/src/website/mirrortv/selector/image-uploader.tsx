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
import _ from 'lodash'

const imagesMutation = gql`
  mutation AddImages($data: [ImageCreateInput!]!) {
    images: createImages(data: $data) {
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
  width: 33.3333%;
  cursor: pointer;
  padding: 0 10px 10px;
`

const Image = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  background: #f0f2f5;
  border-radius: 4px;
`

const ImageNameDisplay = styled.p`
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin: 4px 0;
  word-break: break-all;
`

const Label = styled.label`
  display: block;
  margin: 10px 0 5px 0;
  font-weight: 600;
`

const CustomCheckbox = styled(Checkbox)`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 8px;
`

const WatermarkToggleWrapper = styled.div`
  margin-top: 15px;
  padding: 12px;
  background-color: #f7f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
`

// --- Types ---
type ImageFileData = {
  uid: string
  name: string
  blobURL: string
  type: string
  needWatermark: boolean
}

export type RawImageFileData = Pick<
  ImageFileData,
  'uid' | 'name' | 'blobURL' | 'type'
>

type AddImagesMutationResult = {
  images: ImageEntity[]
}

type AddImagesMutationVariables = {
  data: {
    name: string
    file: {
      upload: File
    }
    needWatermark: boolean
  }[]
}

// --- Sub Components ---
const AddImages = ({ onAddImages }: { onAddImages: (files: RawImageFileData[]) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const inputChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    event.target.files = null
    if (!files) return

    const imagesFiles = await convertFilesToImageData(files)
    onAddImages(imagesFiles)
  }

  return (
    <>
      <CustomButton weight="bold" tone="active" onClick={() => inputRef.current?.click()}>
        + 新增圖片檔案
      </CustomButton>
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

function ImageFile({
  file,
  onChange,
}: {
  file: ImageFileData
  onChange: (file: ImageFileData) => void
}) {
  return (
    <ImageFileWrapper>
      <Image src={file.blobURL} />
      <ImageNameDisplay>{file.name}</ImageNameDisplay>
      <Label htmlFor={`name-${file.uid}`}>圖片標題</Label>
      <TextInput
        id={`name-${file.uid}`}
        defaultValue={file.name}
        onChange={_.debounce((e: ChangeEvent<HTMLInputElement>) => {
          onChange({ ...file, name: e.target.value })
        }, 300)}
      />
      <CustomCheckbox
        checked={file.needWatermark}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange({ ...file, needWatermark: e.target.checked })
        }}
      >
        加上浮水印
      </CustomCheckbox>
    </ImageFileWrapper>
  )
}

// --- Main Component ---
export function ImageUploader({
  onChange,
}: {
  onChange: (images: ImageEntity[]) => void
}) {
  const [files, setFiles] = useState<ImageFileData[]>([])
  const [watermarkAll, setWatermarkAll] = useState(false)
  
  const [
    addImages,
    { data: uploadData, loading: uploadLoading, error: uploadError },
  ] = useMutation<AddImagesMutationResult, AddImagesMutationVariables>(
    imagesMutation
  )

  const onAddImages = (rawFiles: RawImageFileData[]) => {
    const newFiles: ImageFileData[] = rawFiles.map((rawFile) => ({
      ...rawFile,
      needWatermark: watermarkAll,
    }))
    setFiles((prev) => prev.concat(newFiles))
  }

  const onConfirm = async () => {
    if (!files.length) return onChange([])

    // 轉換 blob 為 File 物件
    const tasks = files.map(async (data) => ({
      ...data,
      fileObj: await convertStringToFile(data.blobURL, data.name, data.type),
    }))

    const results = await Promise.allSettled(tasks)
    const preparedData = results
      .filter((res): res is PromiseFulfilledResult<any> => res.status === 'fulfilled')
      .map((res) => res.value)

    addImages({
      variables: {
        data: preparedData.map((d) => ({
          name: d.name,
          file: { upload: d.fileObj },
          needWatermark: d.needWatermark,
        })),
      },
    })
  }

  useEffect(() => {
    if (uploadData?.images?.length) {
      onChange(uploadData.images)
    }
  }, [uploadData, onChange])

  return (
    <DrawerController isOpen={true}>
      <Drawer
        title="批次上傳圖片"
        actions={{
          cancel: {
            label: '取消',
            action: () => onChange([]),
          },
          confirm: {
            label: uploadLoading ? '上傳中...' : '確認上傳',
            action: onConfirm,
            loading: uploadLoading,
          },
        }}
        width="narrow"
      >
        <div style={{ padding: '4px' }}>
          <AddImages onAddImages={onAddImages} />
          
          {files.length > 0 && (
            <WatermarkToggleWrapper>
              <CustomCheckbox
                checked={watermarkAll}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const checked = e.target.checked
                  setWatermarkAll(checked)
                  setFiles((prev) => prev.map((f) => ({ ...f, needWatermark: checked })))
                }}
              >
                <strong>所有圖片均加上浮水印</strong>
              </CustomCheckbox>
            </WatermarkToggleWrapper>
          )}

          <ImagesWrapper>
            <ImageFilesWrapper>
              {files.map((file) => (
                <ImageFile
                  key={file.uid}
                  file={file}
                  onChange={(updatedFile) => {
                    setFiles((prev) => 
                      prev.map((f) => (f.uid === updatedFile.uid ? updatedFile : f))
                    )
                  }}
                />
              ))}
            </ImageFilesWrapper>
          </ImagesWrapper>

          {uploadError && (
            <div style={{ color: '#de350b', marginTop: '15px' }}>
              上傳失敗：{uploadError.message}
            </div>
          )}
        </div>
      </Drawer>
    </DrawerController>
  )
}