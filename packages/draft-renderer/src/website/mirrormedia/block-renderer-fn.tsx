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
  YoutubeBlock,
} = blockRenderers

const AtomicBlock = (props) => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0))
  const { contentLayout } = props.blockProps
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
      return SlideshowBlockV2(entity, contentLayout)
    }
    case 'EMBEDDEDCODE': {
      return EmbeddedCodeBlock(entity, contentLayout)
    }
    case 'INFOBOX': {
      return InfoBoxBlock(props, contentLayout)
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
      return VideoBlock(entity, contentLayout)
    }
    case 'AUDIO': {
      return AudioBlock(entity, contentLayout)
    }
    case 'YOUTUBE': {
      return YoutubeBlock(entity)
    }
  }
  return null
}

export function atomicBlockRenderer(block, contentLayout) {
  if (block.getType() === 'atomic') {
    return {
      component: AtomicBlock,
      editable: false,
      props: { contentLayout },
    }
  }

  return null
}
