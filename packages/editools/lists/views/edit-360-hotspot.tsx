import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'
import React360 from '@readr-media/react-360'

export const Field = ({ value }: FieldProps<typeof controller>) => {
  let pcImageUrl, mbImageUrl
  if (typeof value === 'object') {
    pcImageUrl = value['pcImageUrl']
    mbImageUrl = value['mbImageUrl']
  }
  return (
    <FieldContainer>
      <React360
        imageRwdUrls={{
          pc: pcImageUrl,
          mb: mbImageUrl,
        }}
        isFullScreenWidth={false}
        isEditMode={true}
      />
    </FieldContainer>
  )
}
