import Partner from './Partner'
import User from './User'
import PromotionVideo from './PromotionVideo'
import { utils } from '@mirrormedia/lilith-core'

const { addTrackingFields } = utils
export const listDefinition = {
  User: addTrackingFields(User),
  Partner,
  PromotionVideo,
}
