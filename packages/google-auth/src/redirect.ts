/**
 * Only same-origin relative paths are honoured as a post-login redirect.
 * Anything else falls back so the callback can never become an open redirect.
 */
export function sanitizeRedirectPath(from: unknown, fallback = '/'): string {
  if (typeof from !== 'string' || from.length === 0) return fallback
  if (!from.startsWith('/')) return fallback
  if (from.startsWith('//') || from.startsWith('/\\')) return fallback
  if (/[\r\n]/.test(from)) return fallback
  return from
}
