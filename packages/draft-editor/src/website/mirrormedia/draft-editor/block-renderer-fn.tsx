import { InfoBoxEditorBlock as InfoBoxBlock } from '../custom/block-renderer/info-box-block'
import { TableEditorBlock as TableBlock } from '../custom/block-renderer/table-block'
import { ColorBoxEditorBlock as ColorBoxBlock } from '../custom/block-renderer/color-box-block'
import { BGImageEditorBlock as BGImageBlock } from '../custom/block-renderer/background-image-block'
import { BGVideoEditorBlock as BGVideoBlock } from '../custom/block-renderer/background-video-block'
import { SideIndexEditorBlock as SideIndexBlock } from '../custom/block-renderer/side-index-block'
import { MirrorMedia } from '@mirrormedia/lilith-draft-renderer'

const {
  EmbeddedCodeBlock,
  MediaBlock,
  ImageBlock,
  SlideshowBlock,
  SlideshowBlockV2,
  DividerBlock,
  RelatedPostBlock,
} = MirrorMedia.blockRenderer

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
