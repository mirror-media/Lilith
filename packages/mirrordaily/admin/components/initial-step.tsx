import styled from 'styled-components'
import type { DragEvent } from 'react'
import { createFilesHandler } from '../utils'
import { addImageFiles } from '../redux/features/multi-images/slice'
import { useAppDispatch } from '../redux/hooks'
import HiddenInput from './hidden-input'

const FileDropArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

const UploadButton = styled.label`
  display: inline-block;
  padding: 10px 38px;
  border: 1px solid #000;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  color: #000;
  font-size: 40px;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  cursor: pointer;

  &:active {
    transform: traslateY(2px);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
  }
`

export default function InitialStep() {
  const dispatch = useAppDispatch()
  const changeHandler = createFilesHandler((files) =>
    dispatch(addImageFiles(files))
  )

  const dropHandler = (event: DragEvent) => {
    event.preventDefault()
    changeHandler(event.dataTransfer.files)
  }

  return (
    <FileDropArea
      onDragEnter={(e) => e.preventDefault()}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
      onDrop={dropHandler}
    >
      <span>
        <UploadButton htmlFor="hidden-file-input">
          upload multi images
        </UploadButton>
        <HiddenInput id="hidden-file-input" />
      </span>
    </FileDropArea>
  )
}
