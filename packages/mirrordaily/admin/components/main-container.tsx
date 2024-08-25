import styled from 'styled-components'
import InitialStep from './initial-step'
import EditorStep from './editor-step'
import { useAppSelector } from '../redux/hooks'
import { selectHasFiles } from '../redux/features/multi-images/selector'

const Container = styled.div`
  dispaly: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

export default function MainContainer() {
  const hasFiles = useAppSelector(selectHasFiles)

  return <Container>{hasFiles ? <EditorStep /> : <InitialStep />}</Container>
}
