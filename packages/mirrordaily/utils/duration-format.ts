/**
 * 將秒數轉換為 ISO 8601 duration 格式
 * 例如: 3661 秒 -> "PT1H1M1S"
 * @param seconds 秒數
 * @returns ISO 8601 duration 格式字串
 */
export function secondsToISO8601Duration(seconds: number | null | undefined): string | null {
  if (seconds === null || seconds === undefined || seconds === 0) {
    return null
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  let duration = 'PT'
  
  if (hours > 0) {
    duration += `${hours}H`
  }
  
  if (minutes > 0) {
    duration += `${minutes}M`
  }
  
  if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
    duration += `${remainingSeconds}S`
  }
  
  return duration
}
