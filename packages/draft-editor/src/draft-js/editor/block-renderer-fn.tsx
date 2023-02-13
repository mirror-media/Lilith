import { EmbeddedCodeBlock } from '../block-renderer/embedded-code-block'
import { MediaBlock } from '../block-renderer/media-block'
import { ImageBlock } from '../block-renderer/image-block'
import { InfoBoxBlock } from '../block-renderer/info-box-block'
import {
  SlideshowBlock,
  SlideshowBlockV2,
} from '../block-renderer/slideshow-block'
import { DividerBlock } from '../block-renderer/divider-block'
import { TableBlock } from '../block-renderer/table-block'
import { ColorBoxBlock } from '../block-renderer/color-box-block'
import { BGImageBlock } from '../block-renderer/background-image-block'
import { BGVideoBlock } from '../block-renderer/background-video-block'
import { RelatedPostBlock } from '../block-renderer/related-post-block'
import { SideIndexBlock } from '../block-renderer/side-index-block'

const AtomicBlock = (props) => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0))

  const entityType = entity.getType()

  switch (entityType) {
    case 'audioLink':
    case 'imageLink':
    case 'videoLink': {
      return MediaBlock(entity)
    }
    case 'image': {
      return ImageBlock(entity)
    }
    case 'slideshow': {
      return SlideshowBlock(entity)
    }
    case 'slideshow-v2': {
      return SlideshowBlockV2(entity)
    }
    case 'EMBEDDEDCODE': {
      return EmbeddedCodeBlock(entity)
    }
    case 'INFOBOX': {
      return InfoBoxBlock(props)
    }
    case 'DIVIDER': {
      return DividerBlock()
    }
    case 'TABLE': {
      return TableBlock(props)
    }
    case 'COLORBOX': {
      return ColorBoxBlock(props)
    }
    case 'BACKGROUNDIMAGE': {
      return BGImageBlock(props)
    }
    case 'BACKGROUNDVIDEO': {
      return BGVideoBlock(props)
    }
    case 'RELATEDPOST': {
      return RelatedPostBlock(entity)
    }
    case 'SIDEINDEX': {
      return SideIndexBlock(props)
    }
  }
  return null
}

export function atomicBlockRenderer(block) {
  if (block.getType() === 'atomic') {
    return {
      component: AtomicBlock,
      editable: false,
    }
  }

  return null
}
