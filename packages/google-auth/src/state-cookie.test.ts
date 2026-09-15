import test from 'node:test'
import assert from 'node:assert/strict'
import {
  STATE_COOKIE_NAME,
  STATE_TTL_SECONDS,
  createAuthState,
  sealAuthState,
  unsealAuthState,
} from './state-cookie'

const secret = 'test-secret-that-is-long-enough-for-hmac-1234'

test('constants match the spec', () => {
  assert.equal(STATE_COOKIE_NAME, 'lilith-google-auth-state')
  assert.equal(STATE_TTL_SECONDS, 300)
})

test('createAuthState produces random state and nonce', () => {
  const a = createAuthState('/a', 1000)
  const b = createAuthState('/a', 1000)
  assert.notEqual(a.state, b.state)
  assert.notEqual(a.nonce, b.nonce)
  assert.equal(a.from, '/a')
  assert.equal(a.exp, 1000 + STATE_TTL_SECONDS * 1000)
})

test('seal then unseal round-trips', () => {
  const state = createAuthState('/posts', 1000)
  const sealed = sealAuthState(state, secret)
  assert.deepEqual(unsealAuthState(sealed, secret, 2000), state)
})

test('unseal rejects a tampered payload', () => {
  const sealed = sealAuthState(createAuthState('/', 1000), secret)
  const [payload, sig] = sealed.split('.')
  const tampered = `${payload.slice(0, -2)}AA.${sig}`
  assert.equal(unsealAuthState(tampered, secret, 2000), undefined)
})

test('unseal rejects the wrong secret', () => {
  const sealed = sealAuthState(createAuthState('/', 1000), secret)
  assert.equal(
    unsealAuthState(sealed, 'another-secret-value-1234567890', 2000),
    undefined
  )
})

test('unseal rejects an expired state', () => {
  const state = createAuthState('/', 1000)
  const sealed = sealAuthState(state, secret)
  assert.equal(unsealAuthState(sealed, secret, state.exp), undefined)
})

test('unseal rejects missing or malformed input', () => {
  assert.equal(unsealAuthState(undefined, secret), undefined)
  assert.equal(unsealAuthState('', secret), undefined)
  assert.equal(unsealAuthState('nodot', secret), undefined)
})
