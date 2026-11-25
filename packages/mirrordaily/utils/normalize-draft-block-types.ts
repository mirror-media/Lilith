// Draft.js 內建 article、section 區塊型態；從網頁複製帶格式的文字貼進編輯器時
// 可能出現，貼進去後即使刪光文字也不會變回一般段落。前台只渲染 unstyled，
// 遇到這兩種型態整段前言不會顯示，所以存檔前改成 unstyled。
const WRAPPER_BLOCK_TYPES = new Set(['article', 'section'])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const normalizeWrapperBlockTypes = <T>(raw: T): T => {
  if (!isRecord(raw) || !Array.isArray(raw.blocks)) return raw

  const isWrapper = (block: unknown) =>
    isRecord(block) && WRAPPER_BLOCK_TYPES.has(block.type as string)
  if (!raw.blocks.some(isWrapper)) return raw

  const blocks = raw.blocks.map((block: unknown) =>
    isWrapper(block) ? { ...(block as object), type: 'unstyled' } : block
  )
  return { ...raw, blocks } as T
}
