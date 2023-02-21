import React from 'react'
import { FieldProps } from '@keystone-6/core/types'
import { Button } from '@keystone-ui/button'
import { FieldContainer } from '@keystone-ui/fields'
import { controller } from '@keystone-6/core/fields/types/json/views'

export const Field = ({ value }: FieldProps<typeof controller>) => {
  let modelUrl = ''
  if (typeof value === 'string') {
    modelUrl = encodeURIComponent(value)
  }
  return (
    <FieldContainer>
      <a
        href={`/three/camera-helper/index.html?model_url=${modelUrl}`}
        target="_blank"
        style={{ textDecoration: 'none' }}
      >
        <Button>建立鏡頭移動軌跡（Camera Helper）</Button>
      </a>
    </FieldContainer>
  )
}
