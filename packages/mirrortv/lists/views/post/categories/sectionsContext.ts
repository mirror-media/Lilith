/**
 * @deprecated 此文件已廢棄，請改用通用的 fieldFilterManager
 * 
 * 為了向後兼容，仍然導出 sectionsManager
 * 但內部實現已改為使用通用系統
 * 
 * 新代碼請直接使用：
 * import { fieldFilterManager } from '../../shared/fieldFilterManager'
 * fieldFilterManager.updateField('sections', ids)
 */

import { sectionsManager } from '../../shared/fieldFilterManager'

export { sectionsManager }

