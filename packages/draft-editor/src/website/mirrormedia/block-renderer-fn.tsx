import { InfoBoxEditorBlock as InfoBoxBlock } from './block-renderer/info-box-block'
import { TableEditorBlock as TableBlock } from './block-renderer/table-block'
import { ColorBoxEditorBlock as ColorBoxBlock } from './block-renderer/color-box-block'
import { BGImageEditorBlock as BGImageBlock } from './block-renderer/background-image-block'
import { BGVideoEditorBlock as BGVideoBlock } from './block-renderer/background-video-block'
import { SideIndexEditorBlock as SideIndexBlock } from './block-renderer/side-index-block'
import { EmbeddedCodeEditorBlock as EmbeddedCodeBlock } from './block-renderer/embedded-code-block'
import { SlideshowEditBlock as SlideshowBlock } from './block-renderer/slideshow-block'
import { SlideshowEditBlockV2 as SlideshowBlockV2 } from './block-renderer/slideshow-block'
import MirrorMedia from '@mirrormedia/lilith-draft-renderer/lib/website/mirrormedia'

const {
  MediaBlock,
  ImageBlock,
  DividerBlock,
  RelatedPostBlock,
  VideoBlock,
  AudioBlock,
} = MirrorMedia.blockRenderers

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
    case 'VIDEO': {
      return VideoBlock(entity)
    }
    case 'AUDIO': {
      return AudioBlock(entity)
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
