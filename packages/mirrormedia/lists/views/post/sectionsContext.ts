// 簡單的事件系統來同步 sections 的變化
type SectionsChangeListener = (sectionIds: string[]) => void

class SectionsManager {
  private listeners: Set<SectionsChangeListener> = new Set()
  private currentSections: string[] = []

  subscribe(listener: SectionsChangeListener) {
    this.listeners.add(listener)
    // 立即觸發一次，傳遞當前值
    listener(this.currentSections)
    return () => {
      this.listeners.delete(listener)
    }
  }

  updateSections(sectionIds: string[]) {
    this.currentSections = sectionIds
    this.listeners.forEach(listener => listener(sectionIds))
  }

  getCurrentSections() {
    return this.currentSections
  }
}

export const sectionsManager = new SectionsManager()

