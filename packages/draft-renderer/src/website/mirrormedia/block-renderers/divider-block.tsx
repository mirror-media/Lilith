import React from 'react'
import styled from 'styled-components'

const Divider = styled.hr`
  /* box-sizing: border-box; */
  border-top: 1px solid #9d9d9d;
  /* border-style: inset; */
`

export const DividerBlock = () => {
  return <Divider />
}
