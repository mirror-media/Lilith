import React, { useEffect, useRef } from 'react'
import { DraftEntityInstance } from 'draft-js'
import styled from 'styled-components'
import AmpEmbeddedCodeBlock from './amp/amp-embedded-code-block'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
const Wrapper = styled.div`
  position: relative;
  ${defaultMarginTop}
  ${defaultMarginBottom}
`
export const Block = styled.div`
  position: relative;

  /* styles for image link */
  img.img-responsive {
    margin: 0 auto;
    max-width: 100%;
    height: auto;
    display: block;
  }
  //some embedded code won't set itself in the middle
  iframe {
    max-width: 100%;
    margin-right: auto;
    margin-left: auto;
  }
`

export const Caption = styled.div`
  line-height: 1.43;
  letter-spacing: 0.4px;
  font-size: 14px;
  color: #808080;
  margin-top: 8px;
  padding: 0 15px;
`

export const EmbeddedCodeBlock = (
  entity: DraftEntityInstance,
  contentLayout: string
) => {
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

  function convertIframesToAmp(embeddedCode) {
    // 使用 regex 拿到 iframe tag，並取得內容和 attribute
    const iframeRegex = /<iframe([^>]*)><\/iframe>/g
    const ampEmbeddedCode = embeddedCode.replace(
      iframeRegex,
      (match, attributes) => {
        // 检查 iframe 是否包含 allowfullscreen='true'
        if (attributes.includes('allowfullscreen="true"')) {
          // 将 allowfullscreen 替换为 allow
          attributes = attributes.replace(
            'allowfullscreen="true"',
            'allow="fullscreen"'
          )
        }
        // 使用 amp-iframe tag 替換原來的 iframe tag
        return `<amp-iframe${attributes}></amp-iframe>`
      }
    )

    return ampEmbeddedCode
  }

  if (contentLayout === 'amp') {
    return (
      <div>
        i am amp 3
        <AmpEmbeddedCodeBlock
          embeddedCode={convertIframesToAmp(embeddedCode)}
        />
        {caption ? <Caption>{caption}</Caption> : null}
      </div>
    )
  }

  return (
    <Wrapper>
      <Block ref={embedded} />
      {caption ? <Caption>{caption}</Caption> : null}
    </Wrapper>
  )
}
