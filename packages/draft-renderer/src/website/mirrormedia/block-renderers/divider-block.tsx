import React from 'react'
import styled from 'styled-components'

const Divider = styled.hr`
  border-top: 1px solid #9d9d9d;
  margin-top: 32px;
  margin-bottom: 32px;
`

export const DividerBlock = () => {
  return <Divider />
}
