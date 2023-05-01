import { blockRenderers } from './block-renderers'
import { entityDecorators } from './entity-decorators'
import DraftRenderer from './draft-renderer'
import { hasContentInRawContentBlock, removeEmptyContentBlock } from './utils'

const Readr = {
  DraftRenderer,
  blockRenderers,
  entityDecorators,
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
}

export default Readr
