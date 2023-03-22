import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from '@keystone-ui/button'
import { TextInput } from '@keystone-ui/fields'

const SearchBoxWrapper = styled.div`
  display: flex;
`

export type SearchBoxOnChangeFn = (param: string) => void

export function SearchBox(props: {
  onChange: SearchBoxOnChangeFn
  className: string
}): React.ReactElement {
  const { onChange, className } = props
  const [searchInput, setSearchInput] = useState('')

  return (
    <SearchBoxWrapper className={className}>
      <TextInput
        type="text"
        placeholder="請輸入關鍵字搜尋"
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value)
        }}
      ></TextInput>

      <Button
        onClick={() => {
          onChange(searchInput)
        }}
      >
        Search
      </Button>
    </SearchBoxWrapper>
  )
}
