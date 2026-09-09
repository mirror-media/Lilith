import { createGoogleAuthMiniApp } from './mini-app'
import { createPasswordLoginBlockPlugin } from './password-plugin'
import type { GoogleAuthOptions } from './types'

/**
 * The slice of Keystone's config this wrapper reads or rebuilds. Declared
 * structurally so the package still does not depend on @keystone-6/core; the
 * index signatures let a real `KeystoneConfig` (a type alias, so it carries an
 * implicit index signature) satisfy the constraint while keeping every key the
 * host set.
 *
 * `app` and `context` are `any` on purpose: `extendExpressApp` is a property
 * with a function type, so under `strictFunctionTypes` a narrower parameter
 * type here would make Keystone's own `(app: Express, context: KeystoneContext)`
 * signature unassignable.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type KeystoneConfigLike = {
  [key: string]: unknown
  server?: {
    [key: string]: unknown
    extendExpressApp?: (app: any, context: any) => void | Promise<void>
  }
  graphql?: {
    [key: string]: unknown
    apolloConfig?: {
      [key: string]: unknown
      plugins?: unknown[]
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * `keystoneContext` is supplied by the wrapper from `extendExpressApp`'s own
 * argument; `isEnabled` lets a consumer pass an env block straight through
 * (`{ ...envVar.googleAuth, stateSecret: envVar.session.secret }`).
 */
export type WithGoogleAuthOptions = Omit<
  GoogleAuthOptions,
  'keystoneContext'
> & {
  /** Default true. `false` returns the config untouched. */
  isEnabled?: boolean
}

/**
 * Wraps a Keystone config with Google sign-in: mounts the mini-app at the head
 * of `server.extendExpressApp` and, when the password kill switch is on, adds
 * the Apollo block plugin the mini-app's HTTP guard cannot replace.
 *
 * Mounting first is what lets the mini-app answer `/signin` before the Admin
 * UI middleware claims it; it also means the mini-app stamps its own
 * `X-Robots-Tag` rather than inheriting the host's.
 */
export function withGoogleAuth<C extends KeystoneConfigLike>(
  config: C,
  options: WithGoogleAuthOptions
): C {
  const { isEnabled, ...miniAppOptions } = options
  if (isEnabled === false) return config

  const originalExtendExpressApp = config.server?.extendExpressApp
  const next: KeystoneConfigLike = {
    ...config,
    server: {
      ...config.server,
      extendExpressApp: async (app, context) => {
        app.use(
          createGoogleAuthMiniApp({
            ...miniAppOptions,
            // Keystone's generated context is structurally compatible with
            // the narrow KeystoneContext this package declares.
            keystoneContext: context,
          })
        )
        await originalExtendExpressApp?.(app, context)
      },
    },
  }

  if (options.passwordLoginEnabled === false) {
    next.graphql = {
      ...config.graphql,
      apolloConfig: {
        ...config.graphql?.apolloConfig,
        plugins: [
          createPasswordLoginBlockPlugin(),
          ...(config.graphql?.apolloConfig?.plugins ?? []),
        ],
      },
    }
  }

  return next as C
}
