import * as accessControl from './utils/accessControl'
import addManualOrderRelationshipFields from './utils/manual-order-relationship'
import draftConverter from './custom-fields/rich-text-editor/draft-to-api-data/draft-converter'
import { CustomFile } from './custom-fields/file'
import { CustomRelationship } from './custom-fields/relationship'
import { CustomTimestamp } from './custom-fields/timestamp'
import { addTrackingFields } from './utils/trackingHandler'
import { richTextEditor } from './custom-fields/rich-text-editor'

export const customFields = {
  file: CustomFile,
  relationship: CustomRelationship,
  timestamp: CustomTimestamp,
  richTextEditor,
  draftConverter,
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
