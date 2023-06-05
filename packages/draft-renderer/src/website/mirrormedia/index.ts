import { blockRenderers } from './block-renderers'
import { entityDecorators } from './entity-decorators'
import DraftRenderer from './draft-renderer'
import {
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
  getContentBlocksH2H3,
  getContentTextBlocks,
} from './utils'
import { draftEditorCssExternal } from './shared-style/external-style'

const MirrorMedia = {
  DraftRenderer,
  blockRenderers,
  entityDecorators,
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
  getContentBlocksH2H3,
  getContentTextBlocks,
  draftEditorCssExternal,
}

export default MirrorMedia
