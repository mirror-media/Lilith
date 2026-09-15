/**
 * Only same-origin relative paths are honoured as a post-login redirect.
 * Anything else falls back so the callback can never become an open redirect.
 */
export function sanitizeRedirectPath(from: unknown, fallback = '/'): string {
  if (typeof from !== 'string' || from.length === 0) return fallback
  if (!from.startsWith('/')) return fallback
  if (from.startsWith('//') || from.startsWith('/\\')) return fallback
  // Any C0 control character or DEL: header-splitting vectors beyond CR/LF,
  // plus bytes a proxy or logger may re-interpret.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(from)) return fallback
  return from
}
