import styled from '@emotion/styled'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import {
  selectHasItemSelected,
  selectSelectedFilename,
  selectShouldSetWatermarkToAll,
  selectUidsOfFile,
  selectEventName,
} from '../redux/features/multi-images/selector'
import { isEqual } from 'lodash-es'
import Button from './button'
import Item from './item'
import { useRef, useState } from 'react'
import HiddenInput from './hidden-input'
import {
  removeSelectedItems,
  setShouldSetWatermarkToAll,
  setEventName,
} from '../redux/features/multi-images/slice'
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
  column-gap: 18px;
  margin-top: 38px;
  margin-left: 69px;
  margin-right: 69px;

  @media (max-width: 575px) {
    flex-wrap: wrap;
    margin-left: 10px;
    margin-right: 10px;
    row-gap: 10px;
  }
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

const EventNameWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 12px;
  margin-top: 24px;
  margin-left: 69px;
  margin-right: 69px;

  @media (max-width: 575px) {
    flex-wrap: wrap;
    row-gap: 8px;
    margin-left: 10px;
    margin-right: 10px;
  }
`

const EventNameLabel = styled.label`
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
`

const EventNameInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #000;
  font-size: 16px;
  width: 220px;

  @media (max-width: 575px) {
    width: 100%;
  }
`

const EventNameHint = styled.span`
  font-size: 12px;
  color: #888;
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
  const eventName = useAppSelector(selectEventName)
  const inputRef = useRef<HTMLInputElement>(null)
  const checkInputRef = useRef<HTMLInputElement>(null)
  const checkMediaInputRef = useRef<HTMLInputElement>(null)
  const checkDailyInputRef = useRef<HTMLInputElement>(null)
  const [shouldShowAlert, setShouldShowAlert] = useState(false)
  const [waterMarkType, setWaterMarkType] = useState('mirrormedia')

  return (
    <Body>
      <Container>
        <EventNameWrapper>
          <EventNameLabel htmlFor="event-name-input">
            活動或事件名稱
          </EventNameLabel>
          <EventNameInput
            id="event-name-input"
            type="text"
            value={eventName}
            maxLength={10}
            placeholder="最多 10 個字"
            onChange={(e) => dispatch(setEventName(e.target.value))}
          />
          <EventNameHint>({eventName.length}/10)</EventNameHint>
        </EventNameWrapper>
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
          <Button clickFn={() => checkMediaInputRef.current?.click()}>
            <WatermarkIcon
              ref={checkMediaInputRef}
              type="checkbox"
              checked={waterMarkType === 'mirrormedia'}
              onClick={() => setWaterMarkType('mirrormedia')}
            />
            週刊
          </Button>
          <Button clickFn={() => checkDailyInputRef.current?.click()}>
            <WatermarkIcon
              ref={checkDailyInputRef}
              type="checkbox"
              checked={waterMarkType === 'mirrordaily'}
              onClick={() => setWaterMarkType('mirrordaily')}
            />
            鏡報
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
        <SubmissionButtonAndModal waterMarkType={waterMarkType} />
      </Container>
    </Body>
  )
}
