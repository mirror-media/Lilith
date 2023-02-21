import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { Button } from '@keystone-ui/button'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'

export const Field = ({ value }: FieldProps<typeof controller>) => {
  let id = ''
  if (typeof value === 'string') {
    id = value
  }

  return (
    <FieldContainer>
      <a
        href={`/three/story-points/preview.html?id=${id}`}
        target="_blank"
        style={{ textDecoration: 'none' }}
      >
        <Button>Preview</Button>
      </a>
    </FieldContainer>
  )
}
