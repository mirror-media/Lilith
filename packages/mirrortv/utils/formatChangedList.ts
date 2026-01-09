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
    return changedList
  }

  const result = Object.keys(changedListObj)
    .filter((key) => key !== 'id')
    .map((key) => {
      const value = changedListObj[key]
      return `${key}:${value}`
    })

  return result.join('\n')
}
