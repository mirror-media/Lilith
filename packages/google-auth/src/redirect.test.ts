import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeRedirectPath } from './redirect'

test('accepts a relative path', () => {
  assert.equal(sanitizeRedirectPath('/posts/1?x=1'), '/posts/1?x=1')
})

test('falls back for non-strings and empty values', () => {
  assert.equal(sanitizeRedirectPath(undefined), '/')
  assert.equal(sanitizeRedirectPath(''), '/')
  assert.equal(sanitizeRedirectPath(42, '/home'), '/home')
})

test('rejects absolute and protocol-relative URLs', () => {
  assert.equal(sanitizeRedirectPath('https://evil.example'), '/')
  assert.equal(sanitizeRedirectPath('//evil.example'), '/')
  assert.equal(sanitizeRedirectPath('/\\evil.example'), '/')
})

test('rejects CR/LF injection', () => {
  assert.equal(sanitizeRedirectPath('/ok\r\nSet-Cookie: a=b'), '/')
})
