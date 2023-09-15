import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { Button } from '@keystone-ui/button'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'
import { updateTimestamp } from '../../utils/updateTimestamp'

export const Field = ({ value }: FieldProps<typeof controller>) => {
  const label = 'Now'
  const handleOnClickBtn = () => {
    updateTimestamp(value.mutation, value.time)
  }
  return (
    <FieldContainer>
      <Button onClick={handleOnClickBtn}>{label}</Button>
    </FieldContainer>
  )
}
