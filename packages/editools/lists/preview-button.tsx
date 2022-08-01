import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { Button } from '@keystone-ui/button'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'

export const Field = ({ value }: FieldProps<typeof controller>) => {
  return (
    <FieldContainer>
      <a href={value} target="_blank" style={{ textDecoration: 'none' }}>
        <Button>Preview</Button>
      </a>
    </FieldContainer>
  )
}
