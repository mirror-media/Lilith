import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const STATE_COOKIE_NAME = 'lilith-google-auth-state'
export const STATE_TTL_SECONDS = 300

export type AuthState = {
  state: string
  nonce: string
  from: string
  /** Absolute expiry in ms since epoch. */
  exp: number
}

export function createAuthState(
  from: string,
  now: number = Date.now()
): AuthState {
  return {
    state: randomBytes(32).toString('base64url'),
    nonce: randomBytes(32).toString('base64url'),
    from,
    exp: now + STATE_TTL_SECONDS * 1000,
  }
}

export function sealAuthState(state: AuthState, secret: string): string {
  const payload = Buffer.from(JSON.stringify(state), 'utf8').toString(
    'base64url'
  )
  return `${payload}.${sign(payload, secret)}`
}

export function unsealAuthState(
  sealed: string | undefined,
  secret: string,
  now: number = Date.now()
): AuthState | undefined {
  if (!sealed) return undefined
  const dot = sealed.lastIndexOf('.')
  if (dot <= 0) return undefined
  const payload = sealed.slice(0, dot)
  const signature = sealed.slice(dot + 1)
  const expected = sign(payload, secret)
  const a = Buffer.from(signature, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return undefined
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as Partial<AuthState>
    if (
      typeof parsed.state !== 'string' ||
      typeof parsed.nonce !== 'string' ||
      typeof parsed.from !== 'string' ||
      typeof parsed.exp !== 'number'
    ) {
      return undefined
    }
    if (parsed.exp <= now) return undefined
    return {
      state: parsed.state,
      nonce: parsed.nonce,
      from: parsed.from,
      exp: parsed.exp,
    }
  } catch {
    return undefined
  }
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}
