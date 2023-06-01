import { blockRenderers } from './block-renderers'
import { entityDecorators } from './entity-decorators'
import DraftRenderer from './draft-renderer'
import {
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
  getContentBlocksH2H3,
  getContentTextBlocks,
} from './utils'
const MirrorMedia = {
  DraftRenderer,
  blockRenderers,
  entityDecorators,
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
  getContentBlocksH2H3,
  getContentTextBlocks,
}

export default MirrorMedia
