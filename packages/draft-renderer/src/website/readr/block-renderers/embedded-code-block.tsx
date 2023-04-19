import React, { useEffect, useMemo, useRef } from 'react'
import { DraftEntityInstance } from 'draft-js'
import styled from 'styled-components'
import { parse } from 'node-html-parser'

export const Block = styled.div`
  position: relative;
  /* styles for image link */
  img.img-responsive {
    margin: 0 auto;
    max-width: 100%;
    height: auto;
    display: block;
  }
`

export const Caption = styled.div`
  line-height: 1.43;
  letter-spacing: 0.4px;
  font-size: 14px;
  color: #808080;
  padding: 15px 15px 0 15px;
`

export const EmbeddedCodeBlock = (entity: DraftEntityInstance) => {
  const { caption, embeddedCode } = entity.getData()
  const embedded = useRef(null)

  // const ele = parse(`<div id="draft-embed">${embeddedCode}</div>`)

  const ele = useMemo(() => {
    return parse(`<div id="draft-embed">${embeddedCode}</div>`)
  }, [embeddedCode])
  const nonScripts = useMemo(
    () => ele.querySelectorAll('div#draft-embed > :not(script)'),
    [ele]
  )
  const scripts = useMemo(() => ele.querySelectorAll('script'), [ele])
  const nonScriptHtml = useMemo(
    () => nonScripts.reduce((prev, next) => prev + next.toString(), ''),
    [embeddedCode]
  )

  useEffect(() => {
    if (embedded.current) {
      const node: HTMLElement = embedded.current

      const fragment = document.createDocumentFragment()

      // `embeddedCode` is a string, which may includes
      // multiple '<script>' tags and other html tags.
      // For executing '<script>' tags on the browser,
      // we need to extract '<script>' tags from `embeddedCode` string first.
      //
      // The approach we have here is to parse html string into elements,
      // and we could use DOM element built-in functions,
      // such as `querySelectorAll` method, to query '<script>' elements,
      // and other non '<script>' elements.
      // const parser = new DOMParser()
      // const ele = parser.parseFromString(
      //   `<div id="draft-embed">${embeddedCode}</div>`,
      //   'text/html'
      // )
      // const scripts = ele.querySelectorAll('script')

      scripts.forEach((s) => {
        const scriptEle = document.createElement('script')
        const attrs = s.attributes
        for (const key in attrs) {
          scriptEle.setAttribute(key, attrs[key])
        }
        scriptEle.text = s.text || ''
        fragment.appendChild(scriptEle)
      })

      node.appendChild(fragment)

      return () => {
        node.querySelectorAll('script').forEach(function(script) {
          node.removeChild(script)
        })
      }
    }
  }, [scripts])

  return (
    <div>
      {
        // WORKAROUND:
        // The following `<input>` is to solve [issue 153](https://github.com/mirror-media/openwarehouse-k6/issues/153).
        // If the emebed code generates `<input>` or `<textarea>` and appends them onto DOM,
        // and then the generated `<input>` or `<textarea>` will hijack the users' cursors.
        // It will cause that users could not edit the DraftJS Editor anymore.
        // The following phony `<input>` is used to prevent the generated `<input>` or `<textare>` from
        // hijacking the users' cursors.
      }
      <input hidden disabled />
      <Block
        ref={embedded}
        dangerouslySetInnerHTML={{
          __html: nonScriptHtml,
        }}
      />
      {caption ? <Caption>{caption}</Caption> : null}
    </div>
  )
}
