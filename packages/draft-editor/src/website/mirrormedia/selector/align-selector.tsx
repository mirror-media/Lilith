import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Select } from '@keystone-ui/fields'

const Label = styled.label`
  display: block;
  margin: 10px 0;
  font-weight: 600;
`

const AlignSelect = styled(Select)`
  ${({ menuHeight }) => {
    return `margin-bottom: ${menuHeight}px;`
  }}
`

type Option = { label: string; value: string; isDisabled?: boolean }
type AlignSelectorOnChangeFn = (param: string) => void
type Options = Option[]

export function AlignSelector(props: {
  align: string
  options: Options
  onChange: AlignSelectorOnChangeFn
  onOpen?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuHeight, setMenuHeight] = useState(0)
  const { align, options, onChange, onOpen } = props

  useEffect(() => {
    const selectMenu = document.querySelector(
      '.css-nabggt-menu'
    ) as HTMLElement | null

    if (selectMenu) {
      const styles = window.getComputedStyle(selectMenu)
      const margin =
        parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom'])
      setMenuHeight(selectMenu.offsetHeight + margin)
    } else {
      setMenuHeight(0)
    }
    if (isOpen && onOpen) {
      onOpen()
    }
  }, [isOpen])
  return (
    <React.Fragment>
      <Label htmlFor="alignment">對齊</Label>
      <AlignSelect
        id="alignment"
        // default align === undefined
        value={options.find((option) => option.value === align)}
        options={options}
        onChange={(option) => {
          onChange(option.value)
        }}
        onMenuOpen={() => setIsOpen(true)}
        onMenuClose={() => setIsOpen(false)}
        menuHeight={menuHeight}
      />
    </React.Fragment>
  )
}
