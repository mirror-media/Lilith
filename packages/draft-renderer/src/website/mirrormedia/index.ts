import { blockRenderers } from './block-renderers'
import { entityDecorators } from './entity-decorators'
import DraftRenderer from './draft-renderer'
import { hasContentInRawContentBlock, removeEmptyContentBlock } from './utils'
const MirrorMedia = {
  DraftRenderer,
  blockRenderers,
  entityDecorators,
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
}

export default MirrorMedia
