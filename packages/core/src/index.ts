import * as accessControl from './utils/accessControl'
import addManualOrderRelationshipFields from './utils/manual-order-relationship'
import { addTrackingFields } from './utils/trackingHandler'
import { invalidateCacheAfterOperation } from './utils/invalidate-cache-after-operation'
// @ts-ignore: no type definitions
import { draftConverter } from '@mirrormedia/lilith-draft-editor'
import { richTextEditor } from './custom-fields/rich-text-editor'
import { selectWithColor } from './custom-fields/select-with-color'

export const customFields = {
  draftConverter,
  richTextEditor,
  selectWithColor,
}

export const utils = {
  accessControl,
  addManualOrderRelationshipFields,
  addTrackingFields,
  invalidateCacheAfterOperation,
}

export default {
  customFields,
  utils,
}
