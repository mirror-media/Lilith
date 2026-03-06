import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer, TextArea, FieldLabel } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'

export const Field = ({ value }: FieldProps<typeof controller>) => {
  return (
    <FieldContainer>
      <FieldLabel>Embed Code</FieldLabel>
      <TextArea value={value}></TextArea>
    </FieldContainer>
  )
}
