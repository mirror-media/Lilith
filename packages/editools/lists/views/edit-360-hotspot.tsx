import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'
import React360 from '@readr-media/react-360'

export const Field = ({ value }: FieldProps<typeof controller>) => {
  let imageUrl
  if (typeof value === 'object') {
    imageUrl = value['imageUrl']
  }
  return (
    <FieldContainer>
      <React360
        imageRwdUrls={{
          pc: imageUrl,
          mb: imageUrl,
        }}
        isFullScreenWidth={false}
        isEditMode={true}
      />
    </FieldContainer>
  )
}
