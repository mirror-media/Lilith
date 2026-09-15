import test from 'node:test'
import assert from 'node:assert/strict'
import { createGoogleClient } from './google'

const client = createGoogleClient({
  clientId: 'cid.apps.googleusercontent.com',
  clientSecret: 'secret',
  callbackUrl: 'https://cms.example/auth/google/callback',
})

test('buildAuthUrl includes the OIDC parameters', () => {
  const url = new URL(
    client.buildAuthUrl({ state: 's1', nonce: 'n1', hdHint: 'mirrormedia.mg' })
  )
  assert.equal(
    url.origin + url.pathname,
    'https://accounts.google.com/o/oauth2/v2/auth'
  )
  assert.equal(
    url.searchParams.get('client_id'),
    'cid.apps.googleusercontent.com'
  )
  assert.equal(
    url.searchParams.get('redirect_uri'),
    'https://cms.example/auth/google/callback'
  )
  assert.equal(url.searchParams.get('response_type'), 'code')
  assert.equal(url.searchParams.get('scope'), 'openid email profile')
  assert.equal(url.searchParams.get('state'), 's1')
  assert.equal(url.searchParams.get('nonce'), 'n1')
  assert.equal(url.searchParams.get('hd'), 'mirrormedia.mg')
  assert.equal(url.searchParams.get('prompt'), 'select_account')
})

test('buildAuthUrl omits hd when no hint is given', () => {
  const url = new URL(client.buildAuthUrl({ state: 's1', nonce: 'n1' }))
  assert.equal(url.searchParams.get('hd'), null)
})
