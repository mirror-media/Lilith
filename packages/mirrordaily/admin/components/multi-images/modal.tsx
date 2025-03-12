import styled from '@emotion/styled'

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(179, 177, 177, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000000000;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 30px;
  max-width: 586px;
  max-height: 75%;
  padding: 36px 80px;
  background-color: #fff;
`

export default function Modal({ children }: React.PropsWithChildren) {
  return (
    <Wrapper>
      <Body>{children}</Body>
    </Wrapper>
  )
}
