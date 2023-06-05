import React from 'react'

export default function AmpEmbeddedCodeBlock({
  embeddedCode,
}: {
  embeddedCode: string
}) {
  // const { script, nonScript } = extractScriptElements(embeddedCode)

  return <div dangerouslySetInnerHTML={{ __html: embeddedCode }} />
}
