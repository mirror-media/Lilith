type DraftBlock = {
  data: object
  depth: number
  entityRanges: any[]
  inlineStyleRanges: any[]
  key: string
  text: string
  type: string
}

type Draft = {
  blocks: DraftBlock[]
  entityMap: object
}

const hasContentInRawContentBlock = (rawContentBlock: Draft): boolean => {
  if (
    !rawContentBlock ||
    !rawContentBlock.blocks ||
    !rawContentBlock.blocks.length
  ) {
    return false
  }
  const hasAtomicBlock = Boolean(
    rawContentBlock.blocks.some((block) => block.type === 'atomic')
  )
  if (hasAtomicBlock) {
    return hasAtomicBlock
  }
  const defaultBlockHasContent = Boolean(
    rawContentBlock.blocks
      .filter((block) => block.type !== 'atomic')
      .some((block) => block.text.trim())
  )
  return defaultBlockHasContent
}

const removeEmptyContentBlock = (rawContentBlock: Draft): Draft => {
  const hasContent = hasContentInRawContentBlock(rawContentBlock)
  if (!hasContent) {
    throw new Error(
      'There is no content in rawContentBlock, please check again.'
    )
  }
  const blocksWithHideEmptyBlock = rawContentBlock.blocks
    .map((block) => {
      if (block.type === 'atomic' || block.text.trim()) {
        return block
      } else {
        return undefined
      }
    })
    .filter((item): item is DraftBlock => !!item)

  return { ...rawContentBlock, blocks: blocksWithHideEmptyBlock }
}
const getContentBlocksH2H3 = (
  rawContentBlock: Draft
): Pick<DraftBlock, 'text' | 'key' | 'type'>[] => {
  try {
    const contentBlocks = removeEmptyContentBlock(rawContentBlock)
    return contentBlocks.blocks
      .filter(
        (block) => block.type === 'header-two' || block.type === 'header-three'
      )
      .map((block) => {
        return { key: block.key, text: block.text, type: block.type }
      })
  } catch (error) {
    console.warn(
      `Because ${error}, Function 'getContentBlocksH2H3' return an empty array`
    )
    return []
  }
}

function extractFileExtension(url) {
  const parts = url?.split('.')
  if (parts?.length > 1) {
    return parts[parts.length - 1]
  }
  return null
}

const getContentTextBlocks = (
  rawContentBlock: Draft
): Pick<DraftBlock, 'text' | 'key' | 'type'>[] => {
  try {
    const contentBlocks = removeEmptyContentBlock(rawContentBlock)
    return contentBlocks.blocks
      .filter(
        (block) =>
          block.type === 'header-two' ||
          block.type === 'header-three' ||
          block.type === 'unstyled'
      )
      .map((block) => {
        return { key: block.key, text: block.text, type: block.type }
      })
  } catch (error) {
    console.warn(
      `Because ${error}, Function 'getContentTextBlocks' return an empty array`
    )
    return []
  }
}

function convertToAmpFacebook(embeddedCode) {
  const facebookRegex = /facebook.com\/plugins\/post\.php/i
  if (!facebookRegex.test(embeddedCode)) return embeddedCode

  const urlRegex =
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/plugins\/post\.php\?href=([^&"\s]+)/g
  const widthRegex = /width="([^"]+)"/
  const heightRegex = /height="([^"]+)"/
  const urlMatch = urlRegex.exec(embeddedCode)
  const widthMatch = widthRegex.exec(embeddedCode)
  const heightMatch = heightRegex.exec(embeddedCode)

  if (urlMatch && widthMatch && heightMatch) {
    const url = decodeURIComponent(urlMatch[1])
    const width = widthMatch[1]
    const height = heightMatch[1]

    const ampFacebookCode = `<amp-facebook
      width="${width}"
      height="${height}"
      layout="responsive"
      data-href="${url}"
    ></amp-facebook>`

    return ampFacebookCode
  } else {
    return 'Invalid Facebook embedded code'
  }
}

function convertEmbeddedToAmp(embeddedCode) {
  // Use regex to replace Instagram embedded code with <amp-instagram>
  const igEmbedRegex =
    /<blockquote class="instagram-media"[^>]* data-instgrm-permalink="([^"]+)"[^>]*>[\s\S]*?<\/blockquote>/g
  const ampInstagramCode = embeddedCode.replace(
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

  const ampFacebook = convertToAmpFacebook(ampInstagramCode)

  // Use regex to match Twitter embedded code
  const twitterRegex =
    /<blockquote[^>]* class="twitter-tweet"[^>]*>[\s\S]*?<\/blockquote>/g
  const ampTwitterCode = ampFacebook.replace(twitterRegex, (twitterMatch) => {
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
  })

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
  const ampVideoCode = ampAudioCode.replace(videoRegex, (match, attributes) => {
    // Replace with <amp-video> tag
    return `<amp-video${attributes.replace(
      'controls="true"',
      'controls'
    )}></amp-video>`
  })

  // Use regex to replace TikTok embedded code with <amp-tiktok>
  const tiktokRegex =
    /<blockquote class="tiktok-embed"[^>]* data-video-id="([^"]+)"[^>]*>[\s\S]*?<\/blockquote>/g
  const ampTikTokCode = ampVideoCode.replace(
    tiktokRegex,
    (tiktokMatch, videoId) => {
      return `<amp-tiktok width="325" height="731" data-src="${videoId}"></amp-tiktok>`
    }
  )

  // Use regex to replace Google Maps embedded code with <amp-iframe>
  const googleMapsRegex =
    /<iframe[^>]*src="https:\/\/www\.google\.com\/maps\/embed\?([^"]+)"[^>]*><\/iframe>/g
  const ampGoogleMapsCode = ampTikTokCode.replace(
    googleMapsRegex,
    (googleMapsMatch, queryParams) => {
      return `<amp-iframe width="600" height="450" layout="responsive" sandbox="allow-scripts allow-same-origin allow-popups" src="https://www.google.com/maps/embed?${queryParams}"></amp-iframe>`
    }
  )

  const scriptStyleRegex = /<script|<style|<iframe|<embed|<nft-card/g
  if (scriptStyleRegex.test(ampGoogleMapsCode)) {
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
      line-height: 180%;'><div>AMP不支援此功能，請</div><div style='font-weight: 600; margin-bottom: 4.5px;'>點擊連結觀看完整內容</div><svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.1929 1.18239C12.7694 1.50222 12.4755 1.9516 12.3383 2.45154C11.6583 2.30243 10.9226 2.41624 10.3664 2.8688C9.91637 3.21518 9.62245 3.66456 9.51118 4.19041C8.83114 4.0413 8.09483 4.20757 7.53862 4.66013C7.24725 4.89969 7.0336 5.21697 6.87242 5.53363L4.33315 2.99436C3.47809 2.1393 2.06301 2.05155 1.13579 2.8233C0.606133 3.24932 0.283761 3.88262 0.249587 4.53865C0.215413 5.19469 0.443525 5.84755 0.909921 6.31394L7.62084 13.0249C6.28159 13.1722 5.16727 14.2347 5.04646 15.5474C4.95856 16.309 5.21131 17.0927 5.7289 17.6634C6.22057 18.2081 6.92461 18.5405 7.68492 18.5575C8.20823 18.6561 12.0812 19.3435 13.8078 19.6897C14.6187 19.8634 15.4612 19.591 16.0452 19.0069L23.2393 11.8128C24.195 10.8572 24.24 9.30936 23.2813 8.35066C21.027 6.09641 16.3371 1.40654 16.3371 1.40654C15.4555 0.578027 14.1195 0.463092 13.1929 1.18239ZM22.1669 9.41315C22.5297 9.7759 22.5221 10.4054 22.1504 10.777L14.9829 17.9446C14.7439 18.1835 14.4279 18.2922 14.0879 18.2177C12.2039 17.8734 7.91255 17.0862 7.86009 17.0868C7.80764 17.0874 7.78173 17.0615 7.72927 17.0622C7.36207 17.0666 6.99677 16.9137 6.79012 16.654C6.53101 16.3948 6.43055 16.0289 6.48745 15.6611C6.51718 15.3722 6.67773 15.1081 6.86355 14.9222C7.12902 14.6568 7.49813 14.4949 7.86533 14.4905L9.33414 14.4727C9.64888 14.4689 9.88716 14.2824 10.0218 13.9923C10.1299 13.7288 10.0813 13.4146 9.87397 13.2074L1.91932 5.25272C1.73795 5.07134 1.66212 4.83624 1.69121 4.59986C1.7203 4.36349 1.80185 4.12647 2.01358 3.96656C2.35805 3.67391 2.88199 3.72001 3.21883 4.05685L7.1832 8.02122L7.28684 8.12486L9.48927 10.3273C9.77429 10.6123 10.2464 10.6066 10.5384 10.3146C10.8304 10.0226 10.8361 9.55045 10.5511 9.26543L8.3487 7.063C8.16733 6.88163 8.0915 6.64652 8.12059 6.41014C8.14968 6.17377 8.23122 5.93676 8.44296 5.77684C8.78743 5.4842 9.31137 5.5303 9.64821 5.86714L9.8555 6.07442L11.8247 8.04365C12.1097 8.32867 12.5819 8.32295 12.8739 8.03094C13.1659 7.73893 13.1716 7.26681 12.8866 6.98179L11.021 5.11621C10.8156 4.75155 10.9263 4.27816 11.2701 4.03797C11.6139 3.79778 12.1119 3.81797 12.4488 4.15481L12.7338 4.43983L14.1071 5.81311C14.3921 6.09813 14.8642 6.09241 15.1562 5.8004C15.4482 5.50839 15.454 5.03627 15.1689 4.75125L13.8734 3.4557C13.668 3.09105 13.7787 2.61766 14.1225 2.37747C14.4663 2.13728 14.9644 2.15747 15.3012 2.49431C15.2228 2.46904 19.9127 7.1589 22.1669 9.41315Z" fill="#9D9D9D"/>
      </svg></a>
    `
  }

  const codeWithoutWrongWidth = ampGoogleMapsCode.replace(
    /width="auto"|width="100%"/,
    'width="300px"'
  )

  return codeWithoutWrongWidth
}

export {
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
  getContentBlocksH2H3,
  extractFileExtension,
  getContentTextBlocks,
  convertEmbeddedToAmp,
}
