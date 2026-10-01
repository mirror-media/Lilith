import { ThemeProvider } from 'styled-components'
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
import theme from './theme'

// Re-exported so consumers that borrow individual block renderers (e.g.
// draft-editor's mirrordaily ImageEditorBlock) can wrap them in the exact
// same styled-components instance/context that this package's own
// components use internally, instead of reaching into this package's
// node_modules directly (fragile: depends on yarn's current hoist layout).
const MirrorMedia = {
  DraftRenderer,
  blockRenderers,
  entityDecorators,
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
  getContentBlocksH2H3,
  getContentTextBlocks,
  draftEditorCssExternal,
  ThemeProvider,
  theme,
}

export default MirrorMedia
