import test from 'node:test'
import assert from 'node:assert/strict'
import { emitLogEntry, formatErrorEntry, formatLogEntry } from './log'
import type { GoogleAuthLogEvent } from './types'

function baseEvent(
  overrides: Partial<GoogleAuthLogEvent> = {}
): GoogleAuthLogEvent {
  return {
    type: 'google-login',
    outcome: 'success',
    timestamp: '2026-09-09T04:05:06.789Z',
    userId: '7',
    email: 'a@mirrormedia.mg',
    name: 'A',
    role: 'editor',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
    ...overrides,
  }
}

/** Temporarily records console output; caller restores it in a finally block. */
function captureConsole(method: 'log' | 'error') {
  const calls: unknown[][] = []
  const original = console[method]
  console[method] = (...args: unknown[]) => {
    calls.push(args)
  }
  return {
    calls,
    restore: () => {
      console[method] = original
    },
  }
}

test('formatLogEntry maps a success event to INFO with every field top-level', () => {
  const event = baseEvent()
  const entry = formatLogEntry(event)
  assert.equal(entry.severity, 'INFO')
  assert.equal(entry.message, 'google-login success')
  assert.equal(entry.type, 'google-login')
  assert.equal(entry.timestamp, event.timestamp)
  assert.equal(entry.userId, '7')
  assert.equal(entry.email, 'a@mirrormedia.mg')
  assert.equal(entry.name, 'A')
  assert.equal(entry.role, 'editor')
  assert.equal(entry.ipAddress, '127.0.0.1')
  assert.equal(entry.userAgent, 'test-agent')
})

test('formatLogEntry maps a failure event to WARNING with the reason in the message', () => {
  const event = baseEvent({
    outcome: 'failure',
    reason: 'domain',
    userId: null,
    name: null,
    role: null,
  })
  const entry = formatLogEntry(event)
  assert.equal(entry.severity, 'WARNING')
  assert.equal(entry.message, 'google-login failure: domain')
  assert.equal(entry.type, 'google-login')
  assert.equal(entry.reason, 'domain')
  assert.equal(entry.email, 'a@mirrormedia.mg')
  assert.equal(entry.userId, null)
})

test('formatErrorEntry uses the stack when err is an Error', () => {
  const err = new Error('boom')
  const entry = formatErrorEntry(err, {
    type: 'google-login',
    stage: 'callback',
    email: 'a@mirrormedia.mg',
  })
  assert.equal(entry.severity, 'ERROR')
  assert.equal(entry.message, err.stack)
  assert.equal(entry.type, 'google-login')
  assert.equal(entry.stage, 'callback')
  assert.equal(entry.email, 'a@mirrormedia.mg')
  assert.equal(typeof entry.timestamp, 'string')
})

test('formatErrorEntry stringifies a non-Error thrown value', () => {
  const entry = formatErrorEntry('boom', {
    type: 'google-login',
    stage: 'logger',
  })
  assert.equal(entry.severity, 'ERROR')
  assert.equal(entry.message, 'boom')
  assert.equal(entry.type, 'google-login')
  assert.equal(entry.stage, 'logger')
})

test('emitLogEntry prints INFO/WARNING via console.log as one JSON line', () => {
  const capture = captureConsole('log')
  try {
    emitLogEntry({ severity: 'INFO', message: 'x', foo: 'bar' })
    assert.equal(capture.calls.length, 1)
    assert.equal(capture.calls[0].length, 1)
    const parsed = JSON.parse(capture.calls[0][0] as string)
    assert.deepEqual(parsed, { severity: 'INFO', message: 'x', foo: 'bar' })
  } finally {
    capture.restore()
  }
})

test('emitLogEntry prints ERROR via console.error as one JSON line', () => {
  const capture = captureConsole('error')
  try {
    emitLogEntry({ severity: 'ERROR', message: 'boom', stage: 'callback' })
    assert.equal(capture.calls.length, 1)
    const parsed = JSON.parse(capture.calls[0][0] as string)
    assert.deepEqual(parsed, {
      severity: 'ERROR',
      message: 'boom',
      stage: 'callback',
    })
  } finally {
    capture.restore()
  }
})

test('emitLogEntry routes WARNING to console.log, never console.error', () => {
  const errorCapture = captureConsole('error')
  const logCapture = captureConsole('log')
  try {
    emitLogEntry({ severity: 'WARNING', message: 'x' })
    assert.equal(errorCapture.calls.length, 0)
    assert.equal(logCapture.calls.length, 1)
  } finally {
    errorCapture.restore()
    logCapture.restore()
  }
})
