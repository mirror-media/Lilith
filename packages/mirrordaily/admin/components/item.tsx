import styled from '@emotion/styled'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { selectImageData } from '../redux/features/multi-images/selector'
import { isEqual } from 'lodash-es'
import { setShouldSetWatermarkByUid } from '../redux/features/multi-images/slice'

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  row-gap: 7px;
  width: 201px;
`

const ImageContainer = styled.img`
  display: block;
  width: 100%;
  height: 144px;
  object-fit: contain;
  background-color: #d9d9d9;
`

const InfoContainer = styled.div`
  display: flex;
  column-gap: 10px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: #000;
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
  p {
    margin: 0;
  }
`

const FileNameContainer = styled.p`
  display: inline-block;
  flex-grow: 1;
  flex-shrink: 1;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
`

const WatermarkControl = styled.div`
  display: inline-flex;
  flex-shrink: 0;
  column-gap: 10px;
  align-items: center;

  input[type='checkbox'] {
    -webkit-appearance: none;
    appearance: none;
    background-color: #d9d9d9;
    margin: 0;

    position: relative;
    width: 23px;
    height: 23px;
    cursor: pointer;

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
  }
`

type Props = {
  uid: string
}

export default function Item({ uid }: Props) {
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectImageData(uid), isEqual)

  if (!data) return null

  return (
    <Container>
      <ImageContainer src={data.blobURL} alt={data.name} />
      <InfoContainer>
        <FileNameContainer title={data.name}>{data.name}</FileNameContainer>
        <WatermarkControl>
          <input
            type="checkbox"
            checked={data.shouldSetWatermark}
            onClick={() => dispatch(setShouldSetWatermarkByUid(uid))}
          />
          <p>浮水印</p>
        </WatermarkControl>
      </InfoContainer>
    </Container>
  )
}
