/**
 * 將 JSON 字串轉成多行 key:value 文字列表，並去掉第一個 key（id）
 *
 * @param changedList - JSON 字串
 * @returns 格式化後的多行字串
 */
export const formatChangedList = (changedList: string): string => {
  let changedListObj: Record<string, any>

  try {
    changedListObj = JSON.parse(changedList)
  } catch (err) {
    throw new Error('Invalid JSON string passed to formatChangedList')
  }
  const result = Object.keys(changedListObj).map((key) => {
    return `${key}:${changedListObj[key]}`
  })
  // changeList always has id(arr[0]), but we don't need it
  result.shift()
  return result.join('\n')
}
