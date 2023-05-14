import { blockRenderers } from './block-renderers'
import DraftRenderer from './draft-renderer'
import { entityDecorators } from './entity-decorators'
import {
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
} from './utils/common'
import {
  getFirstBlockEntityType,
  getSideIndexEntityData,
  insertRecommendInContentBlock,
} from './utils/post'

const Readr = {
  DraftRenderer,
  blockRenderers,
  entityDecorators,
  hasContentInRawContentBlock,
  removeEmptyContentBlock,
  getSideIndexEntityData,
  insertRecommendInContentBlock,
  getFirstBlockEntityType,
}

export default Readr
