import styled from '@emotion/styled'
import InitialStep from './initial-step'
import EditorStep from './editor-step'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { selectHasFiles } from '../../redux/features/multi-images/selector'
import { useRouter } from '@keystone-6/core/admin-ui/router'
import { useEffect } from 'react'
import { resetAllState } from '../../redux/features/multi-images/slice'

const Container = styled.div`
  dispaly: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

export default function MainContainer() {
  const dispatch = useAppDispatch()
  const hasFiles = useAppSelector(selectHasFiles)
  const router = useRouter()

  useEffect(() => {
    dispatch(resetAllState())
  }, [router.pathname])

  return <Container>{hasFiles ? <EditorStep /> : <InitialStep />}</Container>
}
