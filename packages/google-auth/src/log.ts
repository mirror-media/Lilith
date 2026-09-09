import type { GoogleAuthLogEvent } from './types'

/**
 * Single-line JSON envelope for Cloud Logging. `severity` lets Cloud Logging
 * parse the entry as `jsonPayload` instead of a multi-line `textPayload`, and
 * an `ERROR` entry whose `message` is a stack trace is picked up by Error
 * Reporting. Shape is shared with the upcoming lilith-core password-login
 * change (separate PR); this file intentionally has no dependency on
 * `@twreporter/errors`.
 */
export type LogEntry = {
  severity: 'INFO' | 'WARNING' | 'ERROR'
  message: string
} & Record<string, unknown>

/**
 * Maps a login event to a log entry. Fields stay top-level (no nesting) so a
 * Logs Explorer query can filter on e.g. `jsonPayload.userId` directly.
 */
export function formatLogEntry(event: GoogleAuthLogEvent): LogEntry {
  if (event.outcome === 'success') {
    return { severity: 'INFO', message: 'google-login success', ...event }
  }
  return {
    severity: 'WARNING',
    message: `google-login failure: ${event.reason}`,
    ...event,
  }
}

/**
 * Maps an unexpected throw (callback catch-all, or a caller-supplied logger
 * throwing) to an ERROR entry. `message` is the stack trace when available so
 * Error Reporting can group and display it; a non-Error thrown value falls
 * back to its string form.
 */
export function formatErrorEntry(
  err: unknown,
  context: { type: 'google-login'; stage: string; email?: string | null }
): LogEntry {
  const message = err instanceof Error && err.stack ? err.stack : String(err)
  return {
    severity: 'ERROR',
    message,
    type: context.type,
    stage: context.stage,
    email: context.email,
    timestamp: new Date().toISOString(),
  }
}

/** Prints `entry` as a single JSON line: `console.error` for ERROR, `console.log` otherwise. */
export function emitLogEntry(entry: LogEntry): void {
  const line = JSON.stringify(entry)
  if (entry.severity === 'ERROR') {
    console.error(line)
  } else {
    console.log(line)
  }
}
