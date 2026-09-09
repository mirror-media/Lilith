import test from 'node:test'
import assert from 'node:assert/strict'
import { ERROR_MESSAGES, renderSigninPage } from './signin-page'

test('renders the Google button carrying from', () => {
  const html = renderSigninPage({
    passwordLoginEnabled: true,
    from: '/posts?x=1',
  })
  assert.match(html, /href="\/auth\/google\?from=%2Fposts%3Fx%3D1"/)
})

test('shows the password link only when enabled', () => {
  const on = renderSigninPage({ passwordLoginEnabled: true, from: '/p' })
  assert.match(on, /href="\/signin\?password=1&amp;from=%2Fp"/)
  const off = renderSigninPage({ passwordLoginEnabled: false, from: '/p' })
  assert.doesNotMatch(off, /password=1/)
})

test('renders the message for a known error code', () => {
  const html = renderSigninPage({
    passwordLoginEnabled: true,
    error: 'no_user',
  })
  assert.ok(html.includes(ERROR_MESSAGES.no_user))
})

test('renders a generic message for an unknown error code', () => {
  const html = renderSigninPage({
    passwordLoginEnabled: true,
    error: '<script>',
  })
  assert.ok(!html.includes('<script>'))
  assert.ok(html.includes('登入失敗'))
})

test('omits the from param when absent', () => {
  const html = renderSigninPage({ passwordLoginEnabled: true })
  assert.match(html, /href="\/auth\/google"/)
})
