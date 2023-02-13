// import { EmbeddedCodeBlock } from '../custom/block-renderer/embedded-code-block'
// import { MediaBlock } from '../custom/block-renderer/media-block'
// import { ImageBlock } from '../custom/block-renderer/image-block'
// import { InfoBoxBlock } from '../custom/block-renderer/info-box-block'
// import {
//   SlideshowBlock,
//   SlideshowBlockV2,
// } from '../custom/block-renderer/slideshow-block'
// import { DividerBlock } from '../custom/block-renderer/divider-block'
// import { TableBlock } from '../custom/block-renderer/table-block'
// import { ColorBoxBlock } from '../custom/block-renderer/color-box-block'
// import {
//   BGImageBlock,
//   BGImageEditorBlock,
// } from '../custom/block-renderer/background-image-block'
// import { BGVideoEditorBlock } from '../custom/block-renderer/background-video-block'
// import { RelatedPostBlock } from '../custom/block-renderer/related-post-block'
// import { SideIndexBlock } from '../custom/block-renderer/side-index-block'

import { EmbeddedCodeBlock } from '../../../draft-js/block-renderer/embedded-code-block'
import { MediaBlock } from '../../../draft-js/block-renderer/media-block'
import { ImageBlock } from '../../../draft-js/block-renderer/image-block'
import { InfoBoxBlock } from '../../../draft-js/block-renderer/info-box-block'
import {
  SlideshowBlock,
  SlideshowBlockV2,
} from '../../../draft-js/block-renderer/slideshow-block'
import { DividerBlock } from '../../../draft-js/block-renderer/divider-block'
import { TableBlock } from '../../../draft-js/block-renderer/table-block'
import { ColorBoxBlock } from '../../../draft-js/block-renderer/color-box-block'
import { BGImageBlock } from '../../../draft-js/block-renderer/background-image-block'
import { BGVideoBlock } from '../../../draft-js/block-renderer/background-video-block'
import { RelatedPostBlock } from '../../../draft-js/block-renderer/related-post-block'
import { SideIndexBlock } from '../../../draft-js/block-renderer/side-index-block'

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
