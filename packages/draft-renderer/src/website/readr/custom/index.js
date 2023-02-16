import { BGImageBlock } from './block-renderer/background-image-block'
import { BGVideoBlock } from './block-renderer/background-video-block'
import { ColorBoxBlock } from './block-renderer/color-box-block'
import { DividerBlock } from './block-renderer/divider-block'
import { EmbeddedCodeBlock } from './block-renderer/embedded-code-block'
import { ImageBlock } from './block-renderer/image-block'
import { InfoBoxBlock } from './block-renderer/info-box-block'
import { MediaBlock } from './block-renderer/media-block'
import { RelatedPostBlock } from './block-renderer/related-post-block'
import { SideIndexBlock } from './block-renderer/side-index-block'
import {
  SlideshowBlock,
  SlideshowBlockV2,
} from './block-renderer/slideshow-block'
import { TableBlock } from './block-renderer/table-block'

import { annotationDecorator } from './entity-decorator/annotation-decorator'
import { linkDecorator } from './entity-decorator/link-decorator'

const blockRenderer = {
  BGImageBlock,
  BGVideoBlock,
  ColorBoxBlock,
  DividerBlock,
  EmbeddedCodeBlock,
  ImageBlock,
  InfoBoxBlock,
  MediaBlock,
  RelatedPostBlock,
  SideIndexBlock,
  SlideshowBlock,
  SlideshowBlockV2,
  TableBlock,
}
const entityDecorator = {
  annotationDecorator,
  linkDecorator,
}

export { blockRenderer, entityDecorator }
