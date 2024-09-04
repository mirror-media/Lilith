import styled from '@emotion/styled'
import { PropsWithChildren } from 'react'

const Element = styled.button<{ $width?: string; $color: string }>`
  display: inline-flex;
  padding: 10px;
  text-align: center;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #000;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  ${({ $width }) => $width && `width: ${$width};`}

  ${({ $color }) => `color: ${$color};`}
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;

  &:not(:disabled) {
    cursor: pointer;
    &:hover,
    &:active {
      background-color: lightgray;
    }
  }

  &:disabled {
    color: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
  }
`

type Props = {
  clickFn?: () => void
  type?: 'button' | 'submit'
  width?: string
  color?: string
  disabled?: boolean
}

export default function Button({
  children,
  clickFn,
  type = 'button',
  width,
  color = '#000',
  disabled,
}: PropsWithChildren<Props>) {
  return (
    <Element
      type={type}
      onClick={clickFn}
      $width={width}
      $color={color}
      disabled={disabled}
    >
      {children}
    </Element>
  )
}
