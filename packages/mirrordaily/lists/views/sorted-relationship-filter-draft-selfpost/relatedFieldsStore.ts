import { useEffect, useMemo, useSyncExternalStore } from 'react'

// Post 的相關文章一/二/三（relatedsOne/relatedsTwo/relatedsThree）是三個獨立
// 的 Keystone 欄位元件，彼此不共享 state，因此用一個 module 層級的共享
// store，讓每個欄位可以看到「其他欄位」目前選了什麼，藉此把重複的選項從自己
// 的下拉選單裡排除掉。
// 以 post id 當作 scope，避免不同篇文章之間互相污染選取狀態。

type Listener = () => void

const scopes = new Map<string, Map<string, string | null>>()
// useSyncExternalStore 要求 getSnapshot 在資料沒變動時回傳同一個參考值，
// 所以另外存一份序列化後的 snapshot，只在資料異動時重新計算。
const snapshots = new Map<string, string>()
const listeners = new Map<string, Set<Listener>>()

function getScope(scopeId: string) {
  let scope = scopes.get(scopeId)
  if (!scope) {
    scope = new Map()
    scopes.set(scopeId, scope)
  }
  return scope
}

function computeSnapshot(scopeId: string) {
  snapshots.set(scopeId, JSON.stringify(Array.from(getScope(scopeId))))
}

function getSnapshot(scopeId: string): string {
  if (!snapshots.has(scopeId)) {
    computeSnapshot(scopeId)
  }
  return snapshots.get(scopeId)!
}

function notify(scopeId: string) {
  listeners.get(scopeId)?.forEach((listener) => listener())
}

function subscribe(scopeId: string, listener: Listener) {
  let set = listeners.get(scopeId)
  if (!set) {
    set = new Set()
    listeners.set(scopeId, set)
  }
  set.add(listener)
  return () => {
    set?.delete(listener)
    if (set && set.size === 0) {
      listeners.delete(scopeId)
    }
  }
}

function setFieldSelection(
  scopeId: string,
  fieldPath: string,
  selectedId: string | null
) {
  const scope = getScope(scopeId)
  if (scope.get(fieldPath) === selectedId) return
  if (selectedId === null) {
    scope.delete(fieldPath)
  } else {
    scope.set(fieldPath, selectedId)
  }
  computeSnapshot(scopeId)
  notify(scopeId)
}

// 把這個欄位目前選的值註冊進共享 scope；欄位卸載時（例如切換到別篇文章）
// 一併清掉，避免殘留的選取狀態污染到下一次掛載。
export function useRegisterRelatedSelection(
  scopeId: string,
  fieldPath: string,
  selectedId: string | null
) {
  useEffect(() => {
    setFieldSelection(scopeId, fieldPath, selectedId)
  }, [scopeId, fieldPath, selectedId])

  useEffect(() => {
    return () => {
      setFieldSelection(scopeId, fieldPath, null)
    }
  }, [scopeId, fieldPath])
}

// 回傳同一個 scope（同一篇文章）中，「其他欄位」目前選取的 id，
// 讓這個欄位可以把它們從自己的下拉選項中排除。
export function useSiblingSelectedIds(
  scopeId: string,
  fieldPath: string
): string[] {
  const raw = useSyncExternalStore(
    (listener) => subscribe(scopeId, listener),
    () => getSnapshot(scopeId)
  )

  return useMemo(() => {
    const entries: [string, string | null][] = JSON.parse(raw)
    return entries
      .filter(([path, id]) => path !== fieldPath && id !== null)
      .map(([, id]) => id as string)
  }, [raw, fieldPath])
}
