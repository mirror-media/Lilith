import { blockRenderers } from './block-renderers'
import { entityDecorators } from './entity-decorators'
import DraftRenderer from './draft-renderer'
import { hasContentInRawContentBlock } from './utils'
const MirrorMedia = {
  DraftRenderer,
  blockRenderers,
  entityDecorators,
  hasContentInRawContentBlock,
}

export default MirrorMedia
