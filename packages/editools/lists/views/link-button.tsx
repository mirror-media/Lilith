import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { Button } from '@keystone-ui/button'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'

export const Field = ({ value }: FieldProps<typeof controller>) => {
  let href = ''
  let label = 'Preview'
  if (typeof value === 'object' && value !== null) {
    href = value['href']
    label = value['label']
  }
  return (
    <FieldContainer>
      <a href={href} target="_blank" style={{ textDecoration: 'none' }}>
        <Button>{label}</Button>
      </a>
    </FieldContainer>
  )
}
