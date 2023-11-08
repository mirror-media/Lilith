import React, { useEffect, useRef } from 'react'
import { DraftEntityInstance } from 'draft-js'
import styled from 'styled-components'
import AmpEmbeddedCodeBlock from './amp/amp-embedded-code-block'
import { defaultMarginTop, defaultMarginBottom } from '../shared-style'
import { ContentLayout } from '../types'
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
  contentLayout: ContentLayout
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
    // Use regex to find iframe tags and get their content and attributes
    const iframeRegex = /<iframe([^>]*)><\/iframe>/g
    const ampEmbeddedCode = embeddedCode.replace(
      iframeRegex,
      (match, attributes) => {
        // Check if the iframe includes allowfullscreen='true'
        if (attributes.includes('allowfullscreen="true"')) {
          // Replace allowfullscreen with allow
          attributes = attributes.replace(
            'allowfullscreen="true"',
            'allow="fullscreen"'
          )
        }
        // Replace with <amp-iframe> tag
        return `<amp-iframe${attributes}></amp-iframe>`
      }
    )

    // Use regex to replace Instagram embedded code with <amp-instagram>
    const igEmbedRegex = /<blockquote class="instagram-media"[^>]* data-instgrm-permalink="([^"]+)"[^>]*>[\s\S]*?<\/blockquote>/g
    const ampInstagramCode = ampEmbeddedCode.replace(
      igEmbedRegex,
      (igEmbedMatch, permalink) => {
        const hasCaptioned = igEmbedMatch.includes('data-instgrm-captioned')
        // Extract shortcode from the permalink
        const shortcodeMatch = permalink.match(/\/p\/([^/?]+)/)
        if (shortcodeMatch) {
          const shortcode = shortcodeMatch[1]
          return `<amp-instagram width="1" height="1" data-shortcode="${shortcode}" ${
            hasCaptioned ? 'data-captioned' : ''
          } layout="responsive"></amp-instagram>`
        }
        // Keep it as-is if unable to extract the shortcode
        return igEmbedMatch
      }
    )

    // Use regex to match Twitter embedded code
    const twitterRegex = /<blockquote[^>]* class="twitter-tweet"[^>]*>[\s\S]*?<\/blockquote>/g
    const ampTwitterCode = ampInstagramCode.replace(
      twitterRegex,
      (twitterMatch) => {
        // Use regex to extract the value of the data-tweet-id attribute
        const tweetIdMatch = twitterMatch.match(
          /twitter\.com\/[^/]+\/status\/(\d+)/i
        )
        if (tweetIdMatch && tweetIdMatch[1]) {
          const tweetId = tweetIdMatch[1]
          if (tweetIdMatch && tweetId) {
            // Replace with <amp-twitter> tag
            return `<amp-twitter width="375" height="472" data-tweetid="${tweetId}"></amp-twitter>`
          }
        }
        // Keep it as-is if unable to extract the tweet ID
        return twitterMatch
      }
    )

    // Use regex to replace <script> tags with <amp-script>
    const scriptRegex = /<script([^>]*)><\/script>/g
    const ampScriptEmbeddedCode = ampTwitterCode.replace(
      scriptRegex,
      (match, attributes) => {
        // Get the value of the 'src' attribute
        const srcMatch = /src="([^"]*)"/.exec(attributes)
        if (srcMatch && srcMatch[1]) {
          // Replace <script> with <amp-script> and add an absolute 'src' attribute
          const absoluteSrc = `https:${srcMatch[1]}`
          return `<amp-script src="${absoluteSrc}"></amp-script>`
        }
        // If 'src' attribute is missing, replace <script> with <amp-script>
        return `<amp-script${attributes}></amp-script>`
      }
    )

    // Use regex to replace <amp-img> tags with empty string if 'src' attribute is missing
    const imgRegex = /<amp-img([^>]*)>/g
    const ampImgEmbeddedCode = ampScriptEmbeddedCode.replace(
      imgRegex,
      (match, attributes) => {
        // Check if <amp-img> includes 'src' attribute
        if (attributes.includes('src=')) {
          // Replace <amp-img> with empty string
          return `<amp-img${attributes}></amp-img>`
        }
        // If 'src' attribute is missing, return an empty string
        return ''
      }
    )

    // Use regex to replace <audio> tags with <amp-audio>
    const audioRegex = /<audio([^>]*)><\/audio>/g
    const ampAudioCode = ampImgEmbeddedCode.replace(
      audioRegex,
      (match, attributes) => {
        // Replace with <amp-audio> tag
        return `<amp-audio${attributes}></amp-audio>`
      }
    )

    // Use regex to replace <video> tags with <amp-video>
    const videoRegex = /<video([^>]*)><\/video>/g
    const ampVideoCode = ampAudioCode.replace(
      videoRegex,
      (match, attributes) => {
        // Replace with <amp-video> tag
        return `<amp-video${attributes}></amp-video>`
      }
    )

    // Use regex to replace TikTok embedded code with <amp-tiktok>
    const tiktokRegex = /<blockquote class="tiktok-embed"[^>]* data-video-id="([^"]+)"[^>]*>[\s\S]*?<\/blockquote>/g
    const ampTikTokCode = ampVideoCode.replace(
      tiktokRegex,
      (tiktokMatch, videoId) => {
        return `<amp-tiktok width="325" height="731" data-src="${videoId}"></amp-tiktok>`
      }
    )

    const scriptStyleRegex = /<script|<style/g
    if (scriptStyleRegex.test(ampTikTokCode)) {
      // css hover 效果由 mm-next 的 amp-main決定。
      // a href 由 amp-proxy 決定
      return `
      <a class='link-to-story' style='
        display: flex; 
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%; 
        height: 210px;
        box-shadow: 1px 1px 2px 2px rgba(0, 0, 0, 0.15) inset;
        color: #888;
        font-family: PingFang TC;
        font-size: 16px;
        font-style: normal;
        font-weight: 300;
        line-height: 180%;'><div>AMP不支援此功能，請</div><div style='font-weight: 600;'>點擊連結觀看完整內容</div></a>
      `
    }
    return ampTikTokCode
  }

  if (contentLayout === 'amp') {
    return (
      <div>
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
