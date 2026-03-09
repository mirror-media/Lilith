// 通用的欄位過濾管理器
type FilterChangeListener = (filterValues: string[]) => void

class FieldFilterManager {
  private listeners: Map<string, Set<FilterChangeListener>> = new Map()
  private currentValues: Map<string, string[]> = new Map()

  /**
   * 訂閱特定欄位的變化
   * @param fieldKey - 要訂閱的欄位鍵值（例如：'sections', 'tags'）
   * @param listener - 當欄位值變化時調用的回調函數
   * @returns 取消訂閱的函數
   */
  subscribe(fieldKey: string, listener: FilterChangeListener) {
    if (!this.listeners.has(fieldKey)) {
      this.listeners.set(fieldKey, new Set())
    }
    
    this.listeners.get(fieldKey)!.add(listener)
    
    // 立即觸發一次，傳遞當前值
    listener(this.currentValues.get(fieldKey) || [])
    
    return () => {
      this.listeners.get(fieldKey)?.delete(listener)
    }
  }

  /**
   * 更新特定欄位的值
   * @param fieldKey - 欄位鍵值
   * @param values - 新的值（ID 陣列）
   */
  updateField(fieldKey: string, values: string[]) {
    this.currentValues.set(fieldKey, values)
    
    const listeners = this.listeners.get(fieldKey)
    if (listeners) {
      listeners.forEach(listener => listener(values))
    }
  }

  /**
   * 獲取特定欄位的當前值
   * @param fieldKey - 欄位鍵值
   * @returns 當前值陣列
   */
  getCurrentValues(fieldKey: string): string[] {
    return this.currentValues.get(fieldKey) || []
  }

  /**
   * 清除特定欄位的所有訂閱
   * @param fieldKey - 欄位鍵值
   */
  clearField(fieldKey: string) {
    this.listeners.delete(fieldKey)
    this.currentValues.delete(fieldKey)
  }

  /**
   * 清除所有訂閱和值
   */
  clearAll() {
    this.listeners.clear()
    this.currentValues.clear()
  }
}

// 創建單例實例
export const fieldFilterManager = new FieldFilterManager()

// 為了向後兼容，保留 sectionsManager
export const sectionsManager = {
  subscribe: (listener: FilterChangeListener) => 
    fieldFilterManager.subscribe('sections', listener),
  updateSections: (sectionIds: string[]) => 
    fieldFilterManager.updateField('sections', sectionIds),
  getCurrentSections: () => 
    fieldFilterManager.getCurrentValues('sections'),
}

