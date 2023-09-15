import { blockRenderers } from './block-renderers'
const {
  EmbeddedCodeBlock,
  MediaBlock,
  ImageBlock,
  InfoBoxBlock,
  SlideshowBlock,
  SlideshowBlockV2,
  DividerBlock,
  TableBlock,
  ColorBoxBlock,
  BGImageBlock,
  BGVideoBlock,
  RelatedPostBlock,
  SideIndexBlock,
  VideoBlock,
  AudioBlock,
} = blockRenderers

const AtomicBlock = (props: any) => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0))

  const entityType = entity.getType()

  switch (entityType) {
    case 'audioLink':
    case 'imageLink':
    case 'videoLink': {
      return MediaBlock(entity)
    }
    case 'image': {
      return ImageBlock(props)
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

export function atomicBlockRenderer(block: any) {
  if (block.getType() === 'atomic') {
    return {
      component: AtomicBlock,
      editable: false,
    }
  }

  return null
}
