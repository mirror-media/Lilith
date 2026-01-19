import React from 'react'
import styled from 'styled-components'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
const Divider = styled.hr`
  border-top: 1px solid #9d9d9d;
  ${defaultMarginTop}
  ${defaultMarginBottom}
`

export const DividerBlock = () => {
  return <Divider />
}
