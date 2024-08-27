import styled from '@emotion/styled'
import { PropsWithChildren } from 'react'

const Element = styled.button<{ $width?: string }>`
  display: inline-flex;
  padding: 10px;
  text-align: center;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #000;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  ${({ $width }) => $width && `width: ${$width};`}

  &:not(:disabled) {
    cursor: pointer;
    &:hover,
    &:active {
      background-color: lightgray;
    }
  }

  &:disabled {
    cursor: not-allowed;
  }

  color: #000;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`

type Props = {
  clickFn?: () => void
  type?: 'button' | 'submit'
  width?: string
  disabled?: boolean
}

export default function Button({
  children,
  clickFn,
  type = 'button',
  width,
  disabled,
}: PropsWithChildren<Props>) {
  return (
    <Element type={type} onClick={clickFn} $width={width} disabled={disabled}>
      {children}
    </Element>
  )
}
