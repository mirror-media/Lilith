import React from 'react'
import styled from 'styled-components'

const Divider = styled.hr`
  box-sizing: border-box;
  border-width: 1px;
  border-style: inset;
  ${({ theme }) => theme.margin.default};
`

export const DividerBlock = () => {
  return <Divider />
}
