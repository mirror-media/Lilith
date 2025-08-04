import styled from '@emotion/styled'
import { convertStringToFile } from '../utils'
import { gql, useMutation } from '@keystone-6/core/admin-ui/apollo'
import Button from './button'
import { useAppSelector } from '../redux/hooks'
import { selectFiles } from '../redux/features/multi-images/selector'
import { isEqual } from 'lodash-es'
import { useDispatch } from 'react-redux'
import { resetAllState } from '../redux/features/multi-images/slice'
import Modal from './modal'

const ButtonWrapper = styled.div`
  display: inline-block;
  align-self: flex-end;
  margin-top: 29px;
  margin-right: 47px;
  margin-bottom: 24px;
`

const TextWrapper = styled.p`
  flex-shrink: 0;
  margin: 0;
  color: #000;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-align: center;
`

const RedText = styled.span`
  margin: 0;
  color: #f00;
`

const ErrorWrapper = styled.p`
  flex-shrink: 1;
  overflow-y: auto;
  font-size: 20px;
`

type SubmissionButtonAndModalProps = {
  waterMarkType?: string
}

export default function SubmissionButtonAndModal({
  waterMarkType = 'mirrormedia',
}: SubmissionButtonAndModalProps) {
  const dispatch = useDispatch()
  const files = useAppSelector(selectFiles, isEqual)

  const [addPhotos, { data, loading, error, reset }] = useMutation(gql`
    mutation AddPhotos($data: [PhotoCreateInput!]!) {
      photos: createPhotos(data: $data) {
        id
        name
      }
    }
  `)

  if (error) console.error(error)

  const onSubmissionClicked = async () => {
    if (loading) return

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
          watermarkType: waterMarkType || 'mirrormedia',
        })),
      },
    })
  }

  return (
    <>
      <ButtonWrapper>
        <Button width="116px" clickFn={onSubmissionClicked} disabled={loading}>
          送出
        </Button>
      </ButtonWrapper>
      {(Boolean(data) || Boolean(error)) && (
        <Modal>
          {error ? (
            <>
              <TextWrapper>
                上傳<RedText>失敗</RedText>
                <br />
                請重新上傳
              </TextWrapper>
              <ErrorWrapper>{error.message}</ErrorWrapper>
              <Button width="116px" clickFn={() => reset()}>
                確認
              </Button>
            </>
          ) : (
            <>
              <TextWrapper>
                上傳成功
                <br />
                請至 Photos 查看照片
              </TextWrapper>
              <Button
                width="116px"
                clickFn={() => {
                  reset()
                  dispatch(resetAllState())
                }}
              >
                確認
              </Button>
            </>
          )}
        </Modal>
      )}
    </>
  )
}
