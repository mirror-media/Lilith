import React from 'react'
import styled from 'styled-components'
import { convertEmbeddedToAmp } from '../../utils'

export const Caption = styled.div`
  line-height: 1.43;
  letter-spacing: 0.4px;
  font-size: 14px;
  color: #808080;
  margin-top: 8px;
  padding: 0 15px;
`

export default function AmpEmbeddedCodeBlock({
  embeddedCode,
  caption,
}: {
  embeddedCode: string
  caption: string
}) {
  return (
    <div>
      <div
        dangerouslySetInnerHTML={{ __html: convertEmbeddedToAmp(embeddedCode) }}
      />
      {caption ? <Caption>{caption}</Caption> : null}
    </div>
  )
}
