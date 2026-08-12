import { useLayoutEffect, useRef } from 'react'

// 全域遞增計數器,用來給每個「抽屜(Drawer/Dialog)」發一個唯一 id。
let scopeCounter = 0

/**
 * 依「欄位最近的那個 [role="dialog"] 元素」決定命名空間。
 *
 * 為什麼用「元素身分」而不是「數 dialog 層數」:
 * Keystone 的抽屜是用 portal 丟到 <body> 底下當兄弟節點,不是一層包一層。
 * 所以「數層數」會讓兩個(甚至巢狀開啟的)抽屜都算成同一層而互相污染。
 * 改成「每個 dialog 元素給一個唯一 id」,同一個抽屜裡的欄位會拿到同一個 id、
 * 不同抽屜(兄弟或巢狀)則各自不同 → 完全隔離。
 *
 * 主頁面(沒有 dialog)固定用 'main'。
 */
function resolveScope(el: HTMLElement | null): string {
  const dialog = el?.closest('[role="dialog"]') as HTMLElement | null
  if (!dialog) return 'main'
  if (!dialog.dataset.ffScope) {
    scopeCounter += 1
    dialog.dataset.ffScope = `dlg${scopeCounter}`
  }
  return dialog.dataset.ffScope
}

/**
 * 給同一個表單裡的欄位共用的「命名空間」。
 *
 * 用法:
 *   const { anchorRef, scopedKey } = useDialogScope()
 *   ...把 <span ref={anchorRef} hidden /> 放進欄位的 render 裡...
 *   fieldFilterManager.updateField(scopedKey('sections'), ids)
 *
 * 同一個表單(同一個 dialog 元素,或同為主頁面)的欄位會算出相同 namespace → 彼此看得到;
 * 不同表單(主頁 vs 抽屜、抽屜 vs 巢狀抽屜)則隔離,不互相污染。
 */
export function useDialogScope<T extends HTMLElement = HTMLSpanElement>() {
  const anchorRef = useRef<T>(null)
  // 預設 'main';掛載後由 layout effect 依實際 DOM 位置更新。
  const scopeRef = useRef('main')

  useLayoutEffect(() => {
    scopeRef.current = resolveScope(anchorRef.current)
  }, [])

  const scopedKey = (field: string) => `${scopeRef.current}:${field}`

  return { anchorRef, scopedKey }
}
