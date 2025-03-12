import styled from '@emotion/styled'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  selectHasItemSelected,
  selectSelectedFilename,
  selectShouldSetWatermarkToAll,
  selectUidsOfFile,
} from '../../redux/features/multi-images/selector'
import { isEqual } from 'lodash-es'
import Button from './button'
import Item from './item'
import { useRef, useState } from 'react'
import HiddenInput from './hidden-input'
import {
  removeSelectedItems,
  setShouldSetWatermarkToAll,
} from '../../redux/features/multi-images/slice'
import SubmissionButtonAndModal from './submission-button-and-modal'
import Modal from './modal'

const Body = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  padding: 20px 10px;
`

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--minVolume, 10px);
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.25),
    -4px -4px 4px 0px rgba(0, 0, 0, 0.25);
`

const ControlGroup = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 38px;
  margin-left: 69px;
  margin-right: 69px;
`

const WatermarkIcon = styled.input`
  -webkit-appearance: none;
  appearance: none;
  background-color: #d9d9d9;
  margin: 0;

  position: relative;
  width: 23px;
  height: 23px;
  background-color: #d9d9d9;
  margin-right: 10px;

  &:checked::before {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    content: 'V';
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
`

const ListGroup = styled.div`
  display: flex;
  flex-shrink: 1;
  flex-grow: 1;
  flex-wrap: wrap;
  column-gap: 41px;
  row-gap: 26px;
  width: 100%;
  overflow-y: auto;
  margin-top: 29px;
  padding-left: 62px;
  padding-right: 62px;
`

const AlertBody = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow-y: hidden;
`

const FileList = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  font-weight: 700;
  margin-top: 8px;
  margin-bottom: 8px;
  overflow-y: auto;
`

const ModalControl = styled.div`
  display: flex;
  column-gap: 16px;
  flex-shrink: 0;
`

export default function EditorStep() {
  const dispatch = useAppDispatch()
  const uids = useAppSelector(selectUidsOfFile, isEqual)
  const shouldSetWatermarkToAll = useAppSelector(selectShouldSetWatermarkToAll)
  const hasItemSelected = useAppSelector(selectHasItemSelected)
  const filenames = useAppSelector(selectSelectedFilename)
  const inputRef = useRef<HTMLInputElement>(null)
  const checkInputRef = useRef<HTMLInputElement>(null)
  const [shouldShowAlert, setShouldShowAlert] = useState(false)

  return (
    <Body>
      <Container>
        <ControlGroup>
          <HiddenInput ref={inputRef} />
          <Button clickFn={() => inputRef.current?.click()}>Add images</Button>
          <Button clickFn={() => checkInputRef.current?.click()}>
            <WatermarkIcon
              ref={checkInputRef}
              type="checkbox"
              checked={shouldSetWatermarkToAll}
              onClick={() => dispatch(setShouldSetWatermarkToAll())}
            />
            watermark
          </Button>
          <Button
            color={'#FB1818'}
            disabled={!hasItemSelected}
            clickFn={() => setShouldShowAlert(true)}
          >
            delete
          </Button>
          {shouldShowAlert && (
            <Modal>
              <AlertBody>
                請確認是否要刪除以下檔案？
                <FileList>
                  <div>
                    {filenames.map((filename) => (
                      <>
                        {filename}
                        <br />
                      </>
                    ))}
                  </div>
                </FileList>
                <ModalControl>
                  <Button
                    color={'#FB1818'}
                    clickFn={() => {
                      dispatch(removeSelectedItems())
                      setShouldShowAlert(false)
                    }}
                  >
                    刪除
                  </Button>
                  <Button clickFn={() => setShouldShowAlert(false)}>
                    取消
                  </Button>
                </ModalControl>
              </AlertBody>
            </Modal>
          )}
        </ControlGroup>
        <ListGroup>
          {uids.map((uid) => (
            <Item key={uid} uid={uid} />
          ))}
        </ListGroup>
        <SubmissionButtonAndModal />
      </Container>
    </Body>
  )
}
