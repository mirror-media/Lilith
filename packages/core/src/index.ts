import * as accessControl from './utils/accessControl'
import addManualOrderRelationshipFields from './utils/manual-order-relationship'
import { addTrackingFields } from './utils/trackingHandler'
import { draftConverter } from '@mirrormedia/lilith-draft-editor'
import { richTextEditor } from './custom-fields/rich-text-editor'

export const customFields = {
  draftConverter,
  richTextEditor,
}

export const utils = {
  accessControl,
  addManualOrderRelationshipFields,
  addTrackingFields,
}

export default {
  customFields,
  utils,
}
