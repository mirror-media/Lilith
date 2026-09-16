import express from 'express'
import type { RequestHandler } from 'express'

/** Field name of Keystone's password mutation for listKey 'User'. */
export const PASSWORD_MUTATION_PATTERN = /\bauthenticateUserWithPassword\b/

/**
 * True when a GraphQL request body (single or batched) selects the password
 * mutation. Aliases cannot hide it because the field name must still appear.
 */
export function requestUsesPasswordLogin(body: unknown): boolean {
  const operations = Array.isArray(body) ? body : [body]
  return operations.some((operation) => {
    if (!operation || typeof operation !== 'object') return false
    const query = (operation as { query?: unknown }).query
    return typeof query === 'string' && PASSWORD_MUTATION_PATTERN.test(query)
  })
}

/**
 * Express handlers that reject the password mutation with 403. Mount on the
 * GraphQL path only when password login is disabled. The 500mb limit mirrors
 * the host packages' own body parser so large DraftJS payloads are not
 * rejected here with 413.
 */
export function createPasswordLoginGuard(): RequestHandler[] {
  const parseJson = express.json({ limit: '500mb' })

  const parseIfNeeded: RequestHandler = (req, res, next) => {
    if (req.method !== 'POST' || req.body !== undefined) return next()
    return parseJson(req, res, next)
  }

  const guard: RequestHandler = (req, res, next) => {
    if (req.method === 'POST' && requestUsesPasswordLogin(req.body)) {
      res.status(403).json({
        errors: [
          {
            message: 'Password login is disabled. Sign in with Google.',
            extensions: { code: 'PASSWORD_LOGIN_DISABLED' },
          },
        ],
      })
      return
    }
    next()
  }

  return [parseIfNeeded, guard]
}
