import type { GoogleAuthErrorCode } from './types'

export const ERROR_MESSAGES: Record<GoogleAuthErrorCode, string> = {
  state: '登入逾時或狀態不符，請重新登入。',
  token: '無法驗證 Google 回傳的資料，請重新登入。',
  domain: '此 Google 帳號不屬於允許的網域。',
  unverified_email: 'Google 帳號的 email 尚未驗證。',
  no_user: '此 email 尚未建立 CMS 帳號，請聯絡管理員。',
  session: '建立登入工作階段失敗，請重試。',
}

const GENERIC_ERROR = '登入失敗，請重新登入。'

export type SigninPageOptions = {
  passwordLoginEnabled: boolean
  from?: string
  error?: string
}

export function renderSigninPage(options: SigninPageOptions): string {
  const fromQuery = options.from
    ? `from=${encodeURIComponent(options.from)}`
    : ''
  const googleHref = fromQuery ? `/auth/google?${fromQuery}` : '/auth/google'
  const passwordHref = fromQuery
    ? `/signin?password=1&${fromQuery}`
    : '/signin?password=1'
  const message = options.error
    ? (ERROR_MESSAGES as Record<string, string>)[options.error] ?? GENERIC_ERROR
    : ''

  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>登入</title>
<style>
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans TC", sans-serif; background: #f4f5f7; color: #172b4d; }
  main { max-width: 360px; margin: 12vh auto; padding: 32px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(9, 30, 66, 0.15); text-align: center; }
  h1 { font-size: 20px; margin: 0 0 24px; }
  .btn { display: block; padding: 12px 16px; border-radius: 6px; background: #1a73e8; color: #fff; text-decoration: none; font-weight: 600; }
  .btn:hover { background: #1765cc; }
  .alt { display: inline-block; margin-top: 20px; color: #5e6c84; font-size: 14px; }
  .error { margin: 0 0 20px; padding: 10px 12px; border-radius: 6px; background: #ffebe6; color: #bf2600; font-size: 14px; }
</style>
</head>
<body>
<main>
  <h1>登入 CMS</h1>
  ${message ? `<p class="error">${escapeHtml(message)}</p>` : ''}
  <a class="btn" href="${escapeHtml(googleHref)}">使用 Google 帳號登入</a>
  ${
    options.passwordLoginEnabled
      ? `<a class="alt" href="${escapeHtml(passwordHref)}">使用密碼登入</a>`
      : ''
  }
</main>
</body>
</html>
`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
