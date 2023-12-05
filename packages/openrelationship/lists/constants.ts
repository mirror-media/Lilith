/** 協作資料處理所需的狀態 */
export enum STATUS {
  VERIFIED = 'verified',
  NOTVERIFIED = 'notverified',
}

export const STATUS_LABEL: Record<STATUS, string> = {
  verified: '已確認',
  notverified: '未確認',
}

export const DESC_LENGTH = 25
