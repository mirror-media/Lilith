import React, { useEffect, useRef } from 'react'
import { DraftEntityInstance } from 'draft-js'
import { Block, Caption } from '../buttons/embedded-code'

export const EmbeddedCodeBlock = (entity: DraftEntityInstance) => {
  const { caption, embeddedCode } = entity.getData()
  const embedded = useRef(null)

  useEffect(() => {
    if (!embedded.current) return
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
    const parser = new DOMParser()
    const ele = parser.parseFromString(
      `<div id="draft-embed">${embeddedCode}</div>`,
      'text/html'
    )
    const scripts = ele.querySelectorAll('script')
    const nonScripts = ele.querySelectorAll('div#draft-embed > :not(script)')

    nonScripts.forEach((ele) => {
      fragment.appendChild(ele)
    })

    scripts.forEach((s) => {
      const scriptEle = document.createElement('script')
      const attrs = s.attributes
      for (let i = 0; i < attrs.length; i++) {
        scriptEle.setAttribute(attrs[i].name, attrs[i].value)
      }
      scriptEle.text = s.text || ''
      fragment.appendChild(scriptEle)
    })

    node.appendChild(fragment)
  }, [embeddedCode])

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
      <Block ref={embedded} />
      {caption ? <Caption>{caption}</Caption> : null}
    </div>
  )
}
