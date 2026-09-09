import type { Request, Response } from 'express'

/**
 * Narrow structural views of Keystone's context. Keeping these local means the
 * package does not pin @keystone-6/core; consumers cast their generated
 * context (see README).
 */
export type KeystoneSessionStrategy = {
  start(args: {
    data: { listKey: string; itemId: string }
    context: KeystoneRequestContext
  }): Promise<string | undefined>
}

export type KeystoneRequestContext = {
  sessionStrategy?: KeystoneSessionStrategy
}

export type KeystoneListQuery = {
  findOne(args: {
    where: Record<string, unknown>
    query?: string
  }): Promise<Record<string, unknown> | null>
}

export type KeystoneContext = {
  sudo(): { query: Record<string, KeystoneListQuery> }
  withRequest(req: Request, res: Response): Promise<KeystoneRequestContext>
}

/**
 * Field names mirror lilith-core's login-logging plugin so both password and
 * Google logins answer the same log query.
 */
export type GoogleAuthLogEvent = {
  type: 'google-login'
  outcome: 'success' | 'failure'
  reason?: GoogleAuthErrorCode
  /** ISO 8601, e.g. 2026-09-09T04:05:06.789Z */
  timestamp: string
  userId: string | null
  email: string | null
  name: string | null
  role: string | null
  ipAddress: string | null
  userAgent: string | null
}

export type GoogleAuthErrorCode =
  | 'state'
  | 'token'
  | 'domain'
  | 'unverified_email'
  | 'no_user'
  | 'session'

export type GoogleAuthOptions = {
  keystoneContext: KeystoneContext
  clientId: string
  clientSecret: string
  /** Absolute URL of the callback route, e.g. https://cms.example/auth/google/callback */
  callbackUrl: string
  /** Google `hd` claim allow-list, e.g. ['mirrormedia.mg', 'readr.tw'] */
  allowedDomains: string[]
  /** Signs the short-lived state cookie. Reuse SESSION_SECRET. */
  stateSecret: string
  /** Default true. When false, password login is hidden and its mutation is rejected. */
  passwordLoginEnabled?: boolean
  /**
   * Path the host serves GraphQL on; must equal `config.graphql.path`.
   * Default '/api/graphql'. Only used to mount the password HTTP guard.
   */
  graphqlPath?: string
  /** Where to send the user after login when no `from` is present. Default '/'. */
  signinRedirectDefault?: string
  logger?: (event: GoogleAuthLogEvent) => void
}
