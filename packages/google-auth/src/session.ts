import type { Request, Response } from 'express'
import type { KeystoneContext } from './types'

export type SessionUser = {
  id: string
  email: string | null
  name: string | null
  role: string | null
}

export type SigninResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: 'no_user' | 'session' }

const SESSION_LIST_KEY = 'User'

/**
 * Looks up the User by email and issues the same session cookie Keystone's
 * password login would. No row is ever created here.
 */
export async function signInByEmail(
  keystoneContext: KeystoneContext,
  req: Request,
  res: Response,
  email: string
): Promise<SigninResult> {
  const row = await keystoneContext.sudo().query[SESSION_LIST_KEY].findOne({
    where: { email },
    query: 'id email name role',
  })
  if (!row || row.id === undefined || row.id === null) {
    return { ok: false, reason: 'no_user' }
  }
  const user: SessionUser = {
    id: String(row.id),
    email: typeof row.email === 'string' ? row.email : null,
    name: typeof row.name === 'string' ? row.name : null,
    role: typeof row.role === 'string' ? row.role : null,
  }

  // start() silently returns undefined without a response-bound context.
  const context = await keystoneContext.withRequest(req, res)
  if (!context.sessionStrategy) return { ok: false, reason: 'session' }
  const token = await context.sessionStrategy.start({
    data: { listKey: SESSION_LIST_KEY, itemId: user.id },
    context,
  })
  if (typeof token !== 'string' || token.length === 0) {
    return { ok: false, reason: 'session' }
  }
  return { ok: true, user }
}
